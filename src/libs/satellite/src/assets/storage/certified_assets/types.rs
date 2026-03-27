use candid::{CandidType, Deserialize};
use junobuild_storage::types::store::AssetKey;
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize)]
pub enum CertifyAssetsCursor {
    Heap { offset: usize },
    Stable { key: Option<AssetKey> },
}
