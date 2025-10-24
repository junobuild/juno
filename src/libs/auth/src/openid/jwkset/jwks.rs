use crate::openid::jwkset::constants::{FAILURE_BACKOFF_BASE_NS, FAILURE_BACKOFF_CAP_NS, FAILURE_BACKOFF_MULTIPLIER, REFRESH_COOLDOWN_NS};
use crate::openid::jwkset::fetch::fetch_openid_certificate;
use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::unsafe_find_jwt_kid;
use crate::openid::types::provider::OpenIdProvider;
use crate::state::types::state::{OpenIdCachedCertificate, OpenIdFetchCertificateResult};
use crate::state::{
    cache_certificate, get_cached_certificate, record_fetch_attempt, record_fetch_failure,
};
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

    if !refresh_allowed(&cached_certificate) {
        return Err(GetOrRefreshJwksError::KeyNotFoundCooldown);
    }

    record_fetch_attempt(provider, auth_heap);

    let fetched_certificate = match fetch_openid_certificate(provider).await {
        Ok(Some(certificate)) => {
            cache_certificate(provider, &certificate, auth_heap);
            certificate
        }
        Ok(None) => {
            record_fetch_failure(provider, auth_heap);
            return Err(GetOrRefreshJwksError::CertificateNotFound);
        }
        Err(e) => {
            record_fetch_failure(provider, auth_heap);
            return Err(GetOrRefreshJwksError::FetchFailed(e));
        }
    };

    if jwks_has_kid(&fetched_certificate.jwks, &unsafe_kid) {
        return Ok(fetched_certificate.jwks.clone());
    }

    Err(GetOrRefreshJwksError::KeyNotFound)
}

fn jwks_has_kid(jwks: &Jwks, kid: &str) -> bool {
    jwks.keys.iter().any(|k| k.kid.as_deref() == Some(kid))
}

fn refresh_allowed(certificate: &Option<OpenIdCachedCertificate>) -> bool {
    let Some(cached_certificate) = certificate.as_ref() else {
        // Certificate was never fetched.
        return true;
    };

    let Some(last_attempt) = cached_certificate.last_fetch_attempt_at else {
        // Unlikely with current implementation
        return true;
    };

    let delay = match &cached_certificate.last_result {
        Some(OpenIdFetchCertificateResult::Failure { consecutive_failures, .. }) => {
            failure_backoff_ns(*consecutive_failures)
        }
        _ => REFRESH_COOLDOWN_NS,
    };

    time().saturating_sub(last_attempt) >= delay
}


fn failure_backoff_ns(consecutive_failures: u8) -> u64 {
    let mut factor: u64 = 1;
    let mut n = consecutive_failures.saturating_sub(1);

    while n > 0 {
        factor = factor.saturating_mul(FAILURE_BACKOFF_MULTIPLIER);
        n -= 1;
    }

    (FAILURE_BACKOFF_BASE_NS.saturating_mul(factor)).min(FAILURE_BACKOFF_CAP_NS)
}