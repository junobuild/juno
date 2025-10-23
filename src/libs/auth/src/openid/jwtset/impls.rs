use crate::openid::jwt::types::errors::{JwtFindKidError, JwtHeaderError, JwtVerifyError};
use crate::openid::jwtset::types::errors::GetOrRefreshJwksError;
use crate::openid::jwtset::types::interface::GetOpenIdCertificate;
use crate::openid::types::provider::OpenIdProvider;

impl From<JwtFindKidError> for GetOrRefreshJwksError {
    fn from(e: JwtFindKidError) -> Self {
        match e {
            JwtFindKidError::BadSig(s) => GetOrRefreshJwksError::BadSig(s),
            JwtFindKidError::BadClaim(c) => GetOrRefreshJwksError::BadClaim(c.to_string()),
            JwtFindKidError::MissingKid => GetOrRefreshJwksError::MissingKid,
        }
    }
}

impl From<&OpenIdProvider> for GetOpenIdCertificate {
    fn from(provider: &OpenIdProvider) -> Self {
        Self {
            provider: provider.clone(),
        }
    }
}
