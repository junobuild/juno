use candid::{CandidType, Deserialize};
use junobuild_shared::types::state::Metadata;
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize)]
pub enum AuthenticateControllerArgs {
    OpenId(OpenIdAuthenticateControllerArgs),
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct OpenIdAuthenticateControllerArgs {
    pub jwt: String,
    pub metadata: Metadata,
    pub max_time_to_live: Option<u64>,
    pub scope: GrantableScope,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum GrantableScope {
    Write,
    Submit,
}
