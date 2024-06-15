pub mod state {
    use candid::{CandidType, Deserialize, Principal};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::{Blob, CollectionKey, Hash};
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Timestamp, Version};
    use junobuild_storage::types::runtime_state::BatchGroupId;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;

    pub type AssetsStable = StableBTreeMap<AssetKey, Asset, Memory>;
    pub type ContentChunksStable = StableBTreeMap<ContentChunkKey, Blob, Memory>;
    pub type BatchGroupProposalsStable =
        StableBTreeMap<BatchGroupProposalKey, BatchGroupProposal, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AssetKey {
        pub batch_group_id: BatchGroupId,
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct ContentChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchGroupProposalKey {
        pub batch_group_id: BatchGroupId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct BatchGroupProposal {
        pub owner: Principal,
        pub evidence: Hash,
        pub status: BatchGroupProposalStatus,
        pub executed_at: Option<Timestamp>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
    pub enum BatchGroupProposalStatus {
        Open,
        Rejected,
        Accepted,
        Executed,
        Failed,
    }
}
