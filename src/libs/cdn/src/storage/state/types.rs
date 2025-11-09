use crate::proposals::ProposalId;
use candid::{CandidType, Deserialize};
use ic_stable_structures::StableBTreeMap;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::memory::Memory;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, EncodingType};
use serde::Serialize;

pub type ProposalAssetsStable = StableBTreeMap<ProposalAssetKey, Asset, Memory>;
pub type ProposalContentChunksStable = StableBTreeMap<ProposalContentChunkKey, Blob, Memory>;

#[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ProposalAssetKey {
    pub proposal_id: ProposalId,
    pub collection: CollectionKey,
    pub full_path: FullPath,
}

#[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ProposalContentChunkKey {
    pub proposal_id: ProposalId,
    pub full_path: FullPath,
    pub encoding_type: EncodingType,
    pub chunk_index: usize,
}
