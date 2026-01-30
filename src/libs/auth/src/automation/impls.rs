use crate::automation::types::{AutomationScope, PrepareAutomationError};
use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;
use junobuild_shared::types::state::ControllerScope;

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

impl From<AutomationScope> for ControllerScope {
    fn from(scope: AutomationScope) -> Self {
        match scope {
            AutomationScope::Write => ControllerScope::Write,
            AutomationScope::Submit => ControllerScope::Submit,
        }
    }
}
