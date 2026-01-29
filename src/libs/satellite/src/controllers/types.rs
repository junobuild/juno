use candid::{CandidType, Deserialize};
use junobuild_auth::openid::credentials::automation::types::errors::VerifyOpenidAutomationCredentialsError;
use junobuild_shared::types::state::{ControllerId, Metadata};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize)]
pub enum AuthenticateControllerArgs {
    OpenId(OpenIdAuthenticateControllerArgs),
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct OpenIdAuthenticateControllerArgs {
    pub jwt: String,
    pub controller_id: ControllerId,
    pub scope: AutomationScope,
    pub metadata: Metadata,
    pub max_time_to_live: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum AutomationScope {
    Write,
    Submit,
}

#[derive(CandidType, Serialize, Deserialize)]
pub enum AuthenticationControllerError {
    VerifyOpenIdCredentials(VerifyOpenidAutomationCredentialsError),
    RegisterController(String),
}

pub type AuthenticateControllerResult = Result<(), AuthenticationControllerError>;
