use crate::types::state::Timestamp;
use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(Default, CandidType, Serialize, Deserialize, Clone)]
pub struct Rate {
    pub tokens: RateTokens,
    pub config: RateConfig,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct RateTokens {
    pub tokens: u64,
    pub updated_at: Timestamp,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct RateConfig {
    pub time_per_token_ns: u64,
    pub max_tokens: u64,
}
