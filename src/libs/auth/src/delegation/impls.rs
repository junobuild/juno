use crate::delegation::types::{GetDelegationError, PrepareDelegationError};
use crate::openid::types::errors::VerifyOpenidCredentialsError;

impl From<VerifyOpenidCredentialsError> for GetDelegationError {
    fn from(e: VerifyOpenidCredentialsError) -> Self {
        match e {
            VerifyOpenidCredentialsError::GetOrFetchJwks(err) => {
                GetDelegationError::GetOrFetchJwks(err)
            }
            VerifyOpenidCredentialsError::GetCachedJwks => GetDelegationError::GetCachedJwks,
            VerifyOpenidCredentialsError::JwtFindProvider(err) => {
                GetDelegationError::JwtFindProvider(err)
            }
            VerifyOpenidCredentialsError::JwtVerify(err) => GetDelegationError::JwtVerify(err),
        }
    }
}

impl From<VerifyOpenidCredentialsError> for PrepareDelegationError {
    fn from(e: VerifyOpenidCredentialsError) -> Self {
        match e {
            VerifyOpenidCredentialsError::GetOrFetchJwks(err) => {
                PrepareDelegationError::GetOrFetchJwks(err)
            }
            VerifyOpenidCredentialsError::GetCachedJwks => PrepareDelegationError::GetCachedJwks,
            VerifyOpenidCredentialsError::JwtFindProvider(err) => {
                PrepareDelegationError::JwtFindProvider(err)
            }
            VerifyOpenidCredentialsError::JwtVerify(err) => PrepareDelegationError::JwtVerify(err),
        }
    }
}
