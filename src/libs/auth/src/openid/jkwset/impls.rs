use crate::openid::jkwset::types::errors::GetOrRefreshJwksError;
use crate::openid::jkwset::types::interface::GetOpenIdCertificateArgs;
use crate::openid::jwt::types::errors::JwtFindKidError;
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

impl From<&OpenIdProvider> for GetOpenIdCertificateArgs {
    fn from(provider: &OpenIdProvider) -> Self {
        Self {
            provider: provider.clone(),
        }
    }
}
