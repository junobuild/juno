use crate::openid::credentials::delegation::types::errors::VerifyOpenidCredentialsError;
use crate::openid::credentials::delegation::types::interface::OpenIdCredential;
use crate::openid::jwkset::{get_jwks, get_or_refresh_jwks};
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::types::errors::JwtVerifyError;
use crate::openid::jwt::types::token::Claims;
use crate::openid::jwt::{unsafe_find_jwt_delegation_provider, verify_openid_jwt};
use crate::openid::types::provider::OpenIdDelegationProvider;
use crate::openid::types::provider::OpenIdProvider;
use crate::openid::utils::build_nonce;
use crate::state::types::config::{OpenIdAuthProviderClientId, OpenIdAuthProviders};
use crate::state::types::state::Salt;
use crate::strategies::AuthHeapStrategy;

type VerifyOpenIdDelegationCredentialsResult =
    Result<(OpenIdCredential, OpenIdDelegationProvider), VerifyOpenidCredentialsError>;

pub async fn verify_openid_credentials_with_jwks_renewal(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdAuthProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdDelegationCredentialsResult {
    let (delegation_provider, config) = unsafe_find_jwt_delegation_provider(providers, jwt)
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
) -> VerifyOpenIdDelegationCredentialsResult {
    let (delegation_provider, config) = unsafe_find_jwt_delegation_provider(providers, jwt)
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
) -> VerifyOpenIdDelegationCredentialsResult {
    let assert_audience = |claims: &Claims| -> Result<(), JwtVerifyError> {
        if claims.aud != client_id.as_str() {
            return Err(JwtVerifyError::BadClaim("aud".to_string()));
        }

        Ok(())
    };

    let assert_no_replay = |claims: &Claims| -> Result<(), JwtVerifyError> {
        let nonce = build_nonce(salt);

        if claims.nonce.as_deref() != Some(nonce.as_str()) {
            return Err(JwtVerifyError::BadClaim("nonce".to_string()));
        }

        Ok(())
    };

    let token = verify_openid_jwt(
        jwt,
        provider.issuers(),
        &jwks.keys,
        &assert_audience,
        &assert_no_replay,
    )
    .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    let credential = OpenIdCredential::from(token);

    Ok((credential, provider.clone()))
}
