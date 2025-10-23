use crate::openid::jkwset::constants::REFRESH_COOLDOWN_NS;
use crate::openid::jkwset::fetch::fetch_openid_certificate;
use crate::openid::jkwset::types::errors::GetOrRefreshJwksError;
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

    if !refresh_allowed(&cached_certificate) {
        return Err(GetOrRefreshJwksError::KeyNotFoundCooldown);
    }

    record_fetch_attempt(provider, auth_heap);

    let fetched_certificate = fetch_openid_certificate(provider)
        .await
        .map_err(GetOrRefreshJwksError::FetchFailed)?
        .ok_or(GetOrRefreshJwksError::CertificateNotFound)?;

    // TODO what do set/do in case of fetch error - i.e. should we keep track of success
    // or error and retry to not block?

    cache_certificate(&provider, &fetched_certificate, auth_heap);

    if jwks_has_kid(&fetched_certificate.jwks, &unsafe_kid) {
        return Ok(fetched_certificate.jwks.clone());
    }

    Err(GetOrRefreshJwksError::KeyNotFound)
}

fn jwks_has_kid(jwks: &Jwks, kid: &str) -> bool {
    jwks.keys.iter().any(|k| k.kid.as_deref() == Some(kid))
}

fn refresh_allowed(certificate: &Option<OpenIdCachedCertificate>) -> bool {
    let last_fetch_attempt = certificate
        .as_ref()
        .and_then(|cert| Some(cert.last_fetch_attempt_at));

    match last_fetch_attempt {
        None => true,
        Some(t) => time().saturating_sub(t) > REFRESH_COOLDOWN_NS,
    }
}
