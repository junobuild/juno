use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt, GOOGLE_JWKS};
use crate::openid::types::{OpenIdCredential, VerifyOpenidCredentialsError};
use crate::openid::utils::build_nonce;
use crate::state::types::config::{OpenIdProviderClientId, OpenIdProviders};
use crate::state::types::state::Salt;

pub fn verify_openid_credentials(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdProviders,
) -> Result<(OpenIdProviderClientId, OpenIdCredential), VerifyOpenidCredentialsError> {
    let (provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    // TODO:
    let jwks: Jwks = serde_json::from_str(GOOGLE_JWKS)
        .map_err(|e| VerifyOpenidCredentialsError::ParseJwksFailed(e.to_string()))?;

    let nonce = build_nonce(salt);

    let token = verify_openid_jwt(
        jwt,
        provider.issuers(),
        &config.client_id,
        &jwks.keys,
        &nonce,
    )
    .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    Ok((config.client_id.clone(), OpenIdCredential::from(token)))
}
