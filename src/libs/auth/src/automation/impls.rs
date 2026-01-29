use crate::automation::types::PrepareAutomationError;
use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;

impl From<VerifyOpenidCredentialsError> for PrepareAutomationError {
    fn from(e: VerifyOpenidCredentialsError) -> Self {
        match e {
            VerifyOpenidCredentialsError::GetOrFetchJwks(err) => {
                PrepareAutomationError::GetOrFetchJwks(err)
            }
            VerifyOpenidCredentialsError::GetCachedJwks => PrepareAutomationError::GetCachedJwks,
            VerifyOpenidCredentialsError::JwtFindProvider(err) => {
                PrepareAutomationError::JwtFindProvider(err)
            }
            VerifyOpenidCredentialsError::JwtVerify(err) => PrepareAutomationError::JwtVerify(err),
        }
    }
}