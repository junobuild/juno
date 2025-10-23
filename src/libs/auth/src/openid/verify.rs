use crate::openid::jkwset::{get_jwks, get_or_refresh_jwks};
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt};
use crate::openid::types::errors::VerifyOpenidCredentialsError;
use crate::openid::types::interface::OpenIdCredential;
use crate::openid::types::provider::OpenIdProvider;
use crate::openid::utils::build_nonce;
use crate::state::types::config::{OpenIdProviderClientId, OpenIdProviders};
use crate::state::types::state::Salt;
use crate::strategies::AuthHeapStrategy;

type VerifyOpenIdCredentialsResult =
    Result<(OpenIdProviderClientId, OpenIdCredential), VerifyOpenidCredentialsError>;

pub async fn verify_openid_credentials_with_jwks_renewal(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdCredentialsResult {
    let (provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let jwks = get_or_refresh_jwks(&provider, jwt, auth_heap)
        .await
        .map_err(|e| VerifyOpenidCredentialsError::GetOrFetchJwks(e))?;

    verify_openid_credentials(jwt, &jwks, &provider, &config.client_id, salt)
}

pub fn verify_openid_credentials_with_cached_jwks(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdCredentialsResult {
    let (provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let jwks = get_jwks(&provider, auth_heap).ok_or(VerifyOpenidCredentialsError::GetCachedJwks)?;

    verify_openid_credentials(jwt, &jwks, &provider, &config.client_id, salt)
}

fn verify_openid_credentials(
    jwt: &str,
    jwks: &Jwks,
    provider: &OpenIdProvider,
    client_id: &OpenIdProviderClientId,
    salt: &Salt,
) -> VerifyOpenIdCredentialsResult {
    let nonce = build_nonce(salt);

    let token = verify_openid_jwt(jwt, provider.issuers(), client_id, &jwks.keys, &nonce)
        .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    Ok((client_id.clone(), OpenIdCredential::from(token)))
}
