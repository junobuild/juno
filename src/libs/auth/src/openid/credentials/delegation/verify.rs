use crate::openid::credentials::delegation::types::interface::OpenIdDelegationCredential;
use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;
use crate::openid::jwkset::{get_jwks, get_or_refresh_jwks};
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt};
use crate::openid::types::provider::OpenIdDelegationProvider;
use crate::openid::types::provider::OpenIdProvider;
use crate::openid::utils::build_nonce;
use crate::state::types::config::{OpenIdAuthProviderClientId, OpenIdAuthProviders};
use crate::state::types::state::Salt;
use crate::strategies::AuthHeapStrategy;

type VerifyOpenIdCredentialsResult =
    Result<(OpenIdDelegationCredential, OpenIdDelegationProvider), VerifyOpenidCredentialsError>;

pub async fn verify_openid_credentials_with_jwks_renewal(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdAuthProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdCredentialsResult {
    let (delegation_provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let provider: OpenIdProvider = (&delegation_provider).into();

    let jwks = get_or_refresh_jwks(&provider, jwt, auth_heap)
        .await
        .map_err(VerifyOpenidCredentialsError::GetOrFetchJwks)?;

    verify_openid_credentials(jwt, &jwks, &delegation_provider, &config.client_id, salt)
}

pub fn verify_openid_credentials_with_cached_jwks(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdAuthProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdCredentialsResult {
    let (delegation_provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let provider: OpenIdProvider = (&delegation_provider).into();

    let jwks = get_jwks(&provider, auth_heap).ok_or(VerifyOpenidCredentialsError::GetCachedJwks)?;

    verify_openid_credentials(jwt, &jwks, &delegation_provider, &config.client_id, salt)
}

fn verify_openid_credentials(
    jwt: &str,
    jwks: &Jwks,
    provider: &OpenIdDelegationProvider,
    client_id: &OpenIdAuthProviderClientId,
    salt: &Salt,
) -> VerifyOpenIdCredentialsResult {
    let nonce = build_nonce(salt);

    let token = verify_openid_jwt(jwt, provider.issuers(), client_id, &jwks.keys, &nonce)
        .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    let credential = OpenIdDelegationCredential::from(token);

    Ok((credential, provider.clone()))
}
