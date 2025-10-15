use crate::delegation::openid::jwt::header::decode_jwt_header;
use crate::delegation::openid::jwt::types::JwtFindProviderError;
use crate::state::types::config::{OpenIdProvider, OpenIdProviderConfig, OpenIdProviders};
use jsonwebtoken::dangerous;
use serde::Deserialize;

#[derive(Clone, Deserialize)]
struct UnsafeClaims {
    pub iss: Option<String>,
}

/// ⚠️ **Warning:** This function decodes the JWT payload *without verifying its signature*.
/// Use only to inspect claims (e.g., `iss`) before performing a verified decode.
pub fn unsafe_find_jwt_provider<'a>(
    providers: &'a OpenIdProviders,
    jwt: &str,
) -> Result<(OpenIdProvider, &'a OpenIdProviderConfig), JwtFindProviderError> {
    // 1) Header sanity check
    decode_jwt_header(jwt).map_err(JwtFindProviderError::from)?;

    // 2) Decode the payload (⚠️ no signature validation)
    let token_data = dangerous::insecure_decode::<UnsafeClaims>(jwt)
        .map_err(|e| JwtFindProviderError::BadSig(e.to_string()))?;

    // 3) Try to find by issuer
    if let Some(iss) = token_data.claims.iss.as_deref() {
        if let Some((prov, cfg)) = providers
            .iter()
            .find(|(provider, _)| provider.issuers().iter().any(|&known_iss| known_iss == iss))
        {
            return Ok((prov.clone(), cfg));
        }
    }

    Err(JwtFindProviderError::NoMatchingProvider)
}
