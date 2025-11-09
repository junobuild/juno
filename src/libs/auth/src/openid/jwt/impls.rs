use crate::openid::jwt::types::errors::{
    JwtFindKidError, JwtFindProviderError, JwtHeaderError, JwtVerifyError,
};

impl From<JwtHeaderError> for JwtVerifyError {
    fn from(e: JwtHeaderError) -> Self {
        match e {
            JwtHeaderError::BadSig(s) => JwtVerifyError::BadSig(s),
            JwtHeaderError::BadClaim(c) => JwtVerifyError::BadClaim(c.to_string()),
        }
    }
}

impl From<JwtHeaderError> for JwtFindProviderError {
    fn from(e: JwtHeaderError) -> Self {
        match e {
            JwtHeaderError::BadSig(s) => JwtFindProviderError::BadSig(s),
            JwtHeaderError::BadClaim(c) => JwtFindProviderError::BadClaim(c.to_string()),
        }
    }
}

impl From<JwtHeaderError> for JwtFindKidError {
    fn from(e: JwtHeaderError) -> Self {
        match e {
            JwtHeaderError::BadSig(s) => JwtFindKidError::BadSig(s),
            JwtHeaderError::BadClaim(c) => JwtFindKidError::BadClaim(c.to_string()),
        }
    }
}
