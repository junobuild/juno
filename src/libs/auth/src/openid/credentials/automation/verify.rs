use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;
use crate::openid::jwkset::get_or_refresh_jwks;
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::types::errors::JwtVerifyError;
use crate::openid::jwt::types::token::Claims;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt};
use crate::openid::types::provider::{OpenIdAutomationProvider, OpenIdProvider};
use crate::state::types::automation::OpenIdAutomationProviders;
use crate::strategies::AuthHeapStrategy;

type VerifyOpenIdAutomationCredentialsResult =
    Result<OpenIdAutomationProvider, VerifyOpenidCredentialsError>;

pub async fn verify_openid_credentials_with_jwks_renewal(
    jwt: &str,
    providers: &OpenIdAutomationProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdAutomationCredentialsResult {
    let (automation_provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let provider: OpenIdProvider = (&automation_provider).into();

    let jwks = get_or_refresh_jwks(&provider, jwt, auth_heap)
        .await
        .map_err(VerifyOpenidCredentialsError::GetOrFetchJwks)?;

    verify_openid_credentials(jwt, &jwks, &automation_provider)
}

fn verify_openid_credentials(
    jwt: &str,
    jwks: &Jwks,
    provider: &OpenIdAutomationProvider,
) -> VerifyOpenIdAutomationCredentialsResult {
    let assert_audience = |claims: &Claims| -> Result<(), JwtVerifyError> {
        // if claims.aud != client_id.as_str() {
        //     return Err(JwtVerifyError::BadClaim("aud".to_string()));
        // }

        // TODO: asser github username and repo

        Ok(())
    };

    let assert_no_replay = |claims: &Claims| -> Result<(), JwtVerifyError> {
        // let nonce = build_nonce(salt);
        //
        // if claims.nonce.as_deref() != Some(nonce.as_str()) {
        //     return Err(JwtVerifyError::BadClaim("nonce".to_string()));
        // }

        // TODO: assert jti

        Ok(())
    };

    verify_openid_jwt(
        jwt,
        provider.issuers(),
        &jwks.keys,
        &assert_audience,
        &assert_no_replay,
    )
    .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    Ok(provider.clone())
}
