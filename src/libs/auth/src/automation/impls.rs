use crate::automation::types::{AutomationScope, PrepareAutomationError};
use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;
use junobuild_shared::types::state::AccessKeyScope;

impl From<VerifyOpenidCredentialsError> for PrepareAutomationError {
    fn from(e: VerifyOpenidCredentialsError) -> Self {
        match e {
            VerifyOpenidCredentialsError::InvalidObservatoryId(err) => {
                PrepareAutomationError::InvalidObservatoryId(err)
            }
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

impl From<AutomationScope> for AccessKeyScope {
    fn from(scope: AutomationScope) -> Self {
        match scope {
            AutomationScope::Write => AccessKeyScope::Write,
            AutomationScope::Submit => AccessKeyScope::Submit,
        }
    }
}
