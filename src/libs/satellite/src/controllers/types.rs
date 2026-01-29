use candid::{CandidType, Deserialize};
use serde::Serialize;
use junobuild_auth::automation::types::{OpenIdPrepareAutomationArgs, PrepareAutomationError};

#[derive(CandidType, Serialize, Deserialize)]
pub enum AuthenticateControllerArgs {
    OpenId(OpenIdPrepareAutomationArgs),
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum AutomationScope {
    Write,
    Submit,
}

#[derive(CandidType, Serialize, Deserialize)]
pub enum AuthenticationAutomationError {
    PrepareAutomation(PrepareAutomationError),
    RegisterController(String),
}

pub type AuthenticateAutomationResult = Result<(), AuthenticationAutomationError>;
