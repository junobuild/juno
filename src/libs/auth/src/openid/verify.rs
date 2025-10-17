use crate::openid::jwt::types::Jwks;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt, GOOGLE_JWKS};
use crate::openid::types::{OpenIdCredentialKey, VerifyOpenidCredentialsError};
use crate::openid::utils::build_nonce;
use crate::state::types::config::{OpenIdProviderClientId, OpenIdProviders};

pub fn verify_openid_credentials(
    jwt: &str,
    salt: &[u8; 32],
    providers: &OpenIdProviders,
) -> Result<(OpenIdProviderClientId, OpenIdCredentialKey), VerifyOpenidCredentialsError> {
    let (provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(|e| VerifyOpenidCredentialsError::JwtFindProvider(e))?;

    // TODO:
    let jwks: Jwks = serde_json::from_str(GOOGLE_JWKS)
        .map_err(|e| VerifyOpenidCredentialsError::ParseJwksFailed(e.to_string()))?;

    let nonce = build_nonce(salt);

    let token = verify_openid_jwt(
        jwt,
        &provider.issuers(),
        &config.client_id,
        &jwks.keys,
        &nonce,
    )
    .map_err(|e| VerifyOpenidCredentialsError::JwtVerify(e))?;

    let key = OpenIdCredentialKey {
        iss: token.claims.iss,
        sub: token.claims.sub,
    };

    Ok((config.client_id.clone(), key))
}
