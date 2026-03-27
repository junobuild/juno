use crate::assets::storage::types::state::StableKey;
use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize)]
pub enum CertifyAssetsCursor {
    Heap { offset: usize },
    Stable { key: Option<StableKey> },
}
