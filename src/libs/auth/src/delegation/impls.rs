use crate::delegation::types::{GetDelegationError, PrepareDelegationError};
use std::fmt;

impl fmt::Display for PrepareDelegationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PrepareDelegationError::DeriveSeedFailed(err) => {
                write!(f, "Seed derivation failed: {err}")
            }
            PrepareDelegationError::ParseJwksFailed(err) => {
                write!(f, "Failed to parse JWKS: {err}")
            }
            PrepareDelegationError::JwtVerify(err) => write!(f, "Invalid JWT: {err}"),
            PrepareDelegationError::JwtFindProvider(err) => {
                write!(f, "JWT provider not found: {err}")
            }
        }
    }
}

impl fmt::Display for GetDelegationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GetDelegationError::NoSuchDelegation => write!(f, "No such delegation"),
            GetDelegationError::DeriveSeedFailed(err) => write!(f, "Seed derivation failed: {err}"),
            GetDelegationError::ParseJwksFailed(err) => write!(f, "Failed to parse JWKS: {err}"),
            GetDelegationError::JwtVerify(err) => write!(f, "Invalid JWT: {err}"),
            GetDelegationError::JwtFindProvider(err) => write!(f, "JWT provider not found: {err}"),
        }
    }
}
