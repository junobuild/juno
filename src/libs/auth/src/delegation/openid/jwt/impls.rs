use crate::delegation::openid::jwt::types::{JwtFindProviderError, JwtHeaderError, JwtVerifyError};
use std::fmt;

impl fmt::Display for JwtVerifyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JwtVerifyError::MissingKid => write!(f, "Missing kid"),
            JwtVerifyError::NoKeyForKid => write!(f, "No key for kid"),
            JwtVerifyError::BadSig(err) => write!(f, "Bad signature: {err}"),
            JwtVerifyError::BadClaim(err) => write!(f, "Bad claim: {err}"),
        }
    }
}

impl fmt::Display for JwtFindProviderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JwtFindProviderError::BadSig(err) => write!(f, "Bad signature: {err}"),
            JwtFindProviderError::BadClaim(err) => write!(f, "Bad claim: {err}"),
            JwtFindProviderError::NoMatchingProvider => {
                write!(f, "No matching OpenID provider for JWT (iss/aud mismatch)")
            }
        }
    }
}

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

impl fmt::Display for JwtHeaderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JwtHeaderError::BadSig(err) => write!(f, "Bad signature: {err}"),
            JwtHeaderError::BadClaim(err) => write!(f, "Bad claim: {err}"),
        }
    }
}
