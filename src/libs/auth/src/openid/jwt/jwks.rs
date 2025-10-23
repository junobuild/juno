use candid::Deserialize;
use jsonwebtoken::dangerous;
use crate::openid::jwt::header::decode_jwt_header;
use crate::openid::jwt::types::errors::JwtFindProviderError;
use crate::openid::types::provider::OpenIdProvider;

#[derive(Clone, Deserialize)]
struct UnsafeHeaderClaims {
    pub iss: Option<String>,
    pub sub: Option<String>,
    pub aud: Option<String>,
}

pub fn unsafe_jwks_has_kid(provider: &OpenIdProvider, jwt: &str) {
    // 1) Header sanity check
    decode_jwt_header(jwt).map_err(JwtFindProviderError::from)?;

    // 2) Decode the payload (⚠️ no signature validation)
    let token_data = dangerous::insecure_decode::<UnsafeClaims>(jwt)
        .map_err(|e| JwtFindProviderError::BadSig(e.to_string()))?;

    let kid = token_data.claims.kid.ok_or(VerifyOpenidCredentialsError::MissingKid)?;
}