use candid::{CandidType, Deserialize};
use junobuild_auth::automation::types::{OpenIdPrepareAutomationArgs, PrepareAutomationError};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize)]
pub enum AuthenticateAutomationArgs {
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
