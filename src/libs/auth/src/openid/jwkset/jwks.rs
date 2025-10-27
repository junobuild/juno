use crate::openid::jwkset::constants::{
    FAILURE_BACKOFF_BASE_NS, FAILURE_BACKOFF_CAP_NS, FAILURE_BACKOFF_MULTIPLIER,
    REFRESH_COOLDOWN_NS,
};
use crate::openid::jwkset::fetch::fetch_openid_certificate;
use crate::openid::jwkset::targets::target_observatory_id;
use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::unsafe_find_jwt_kid;
use crate::openid::types::provider::OpenIdProvider;
use crate::state::types::state::OpenIdCachedCertificate;
use crate::state::{cache_certificate, get_cached_certificate, record_fetch_attempt};
use crate::strategies::AuthHeapStrategy;
use ic_cdk::api::time;

pub fn get_jwks(provider: &OpenIdProvider, auth_heap: &impl AuthHeapStrategy) -> Option<Jwks> {
    let cached_certificate = get_cached_certificate(provider, auth_heap);

    cached_certificate
        .as_ref()
        .and_then(|cert| cert.certificate.as_ref())
        .map(|certificate| certificate.jwks.clone())
}

pub async fn get_or_refresh_jwks(
    provider: &OpenIdProvider,
    jwt: &str,
    auth_heap: &impl AuthHeapStrategy,
) -> Result<Jwks, GetOrRefreshJwksError> {
    let unsafe_kid = unsafe_find_jwt_kid(jwt)?;

    let cached_certificate = get_cached_certificate(provider, auth_heap);

    let cached_jwks = cached_certificate
        .as_ref()
        .and_then(|cert| cert.certificate.as_ref())
        .filter(|certificate| jwks_has_kid(&certificate.jwks, &unsafe_kid))
        .map(|certificate| certificate.jwks.clone());

    if let Some(cached_jwks) = cached_jwks {
        return Ok(cached_jwks);
    }

    match refresh_allowed(&cached_certificate) {
        RefreshStatus::AllowedFirstFetch | RefreshStatus::AllowedRetry => {
            record_fetch_attempt(provider, false, auth_heap);
        }
        RefreshStatus::AllowedAfterCooldown => {
            record_fetch_attempt(provider, true, auth_heap);
        }
        RefreshStatus::Denied => {
            return Err(GetOrRefreshJwksError::KeyNotFoundCooldown);
        }
    }

    let observatory_id =
        target_observatory_id(auth_heap).map_err(GetOrRefreshJwksError::InvalidConfig)?;

    let fetched_certificate = fetch_openid_certificate(provider, observatory_id)
        .await
        .map_err(GetOrRefreshJwksError::FetchFailed)?
        .ok_or(GetOrRefreshJwksError::CertificateNotFound)?;

    cache_certificate(provider, &fetched_certificate, auth_heap)
        .map_err(GetOrRefreshJwksError::MissingLastAttempt)?;

    if jwks_has_kid(&fetched_certificate.jwks, &unsafe_kid) {
        return Ok(fetched_certificate.jwks.clone());
    }

    Err(GetOrRefreshJwksError::KeyNotFound)
}

fn jwks_has_kid(jwks: &Jwks, kid: &str) -> bool {
    jwks.keys.iter().any(|k| k.kid.as_deref() == Some(kid))
}

pub enum RefreshStatus {
    AllowedFirstFetch,
    AllowedAfterCooldown,
    AllowedRetry,
    Denied,
}

fn refresh_allowed(certificate: &Option<OpenIdCachedCertificate>) -> RefreshStatus {
    let Some(cached_certificate) = certificate.as_ref() else {
        // Certificate was never fetched.
        return RefreshStatus::AllowedFirstFetch;
    };

    let since_last_attempt = time().saturating_sub(cached_certificate.last_fetch_attempt.at);

    if since_last_attempt >= REFRESH_COOLDOWN_NS {
        return RefreshStatus::AllowedAfterCooldown;
    }

    let delay = attempt_backoff_ns(cached_certificate.last_fetch_attempt.streak_count);

    if since_last_attempt >= delay {
        RefreshStatus::AllowedRetry
    } else {
        RefreshStatus::Denied
    }
}

fn attempt_backoff_ns(streak_count: u8) -> u64 {
    let mut factor: u64 = 1;
    let mut n = streak_count.max(1).saturating_sub(1);

    while n > 0 {
        factor = factor.saturating_mul(FAILURE_BACKOFF_MULTIPLIER);
        n -= 1;
    }

    (FAILURE_BACKOFF_BASE_NS.saturating_mul(factor)).min(FAILURE_BACKOFF_CAP_NS)
}
