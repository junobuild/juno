use crate::delegation::openid::jwt::types::{JwtFindProviderError, JwtVerifyError};
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
