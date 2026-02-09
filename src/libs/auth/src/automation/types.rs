use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
use crate::openid::jwt::types::errors::{JwtFindProviderError, JwtVerifyError};
use crate::state::types::state::Salt;
use candid::{CandidType, Deserialize};
use junobuild_shared::types::state::ControllerId;
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize)]
pub struct OpenIdPrepareAutomationArgs {
    pub jwt: String,
    pub salt: Salt,
}

pub type PrepareAutomationResult = Result<PreparedAutomation, PrepareAutomationError>;

#[derive(CandidType, Serialize, Deserialize)]
pub struct PreparedAutomation {
    pub controller: PreparedControllerAutomation,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct PreparedControllerAutomation {
    pub id: ControllerId,
    pub scope: AutomationScope,
    pub expires_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum AutomationScope {
    Write,
    Submit,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum PrepareAutomationError {
    ControllerAlreadyExists,
    InvalidController(String),
    TooManyControllers(String),
    GetOrFetchJwks(GetOrRefreshJwksError),
    GetCachedJwks,
    JwtFindProvider(JwtFindProviderError),
    JwtVerify(JwtVerifyError),
}
