use crate::openid::jwt::types::errors::JwtFindKidError;
use crate::openid::jwtset::types::errors::GetOrRefreshJwksError;

impl From<JwtFindKidError> for GetOrRefreshJwksError {
    fn from(e: JwtFindKidError) -> Self {
        match e {
            JwtFindKidError::BadSig(s) => GetOrRefreshJwksError::BadSig(s),
            JwtFindKidError::BadClaim(c) => GetOrRefreshJwksError::BadClaim(c.to_string()),
            JwtFindKidError::MissingKid => GetOrRefreshJwksError::MissingKid,
        }
    }
}
