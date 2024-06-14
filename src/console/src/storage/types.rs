pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::{Blob, CollectionKey, Hash};
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::runtime_state::BatchGroupId;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;

    pub type BatchGroupAssetsStable = StableBTreeMap<BatchGroupStableKey, Asset, Memory>;
    pub type BatchGroupContentChunksStable =
        StableBTreeMap<BatchGroupStableEncodingChunkKey, Blob, Memory>;
    pub type BatchGroupProposalsStable =
    StableBTreeMap<BatchGroupProposalStableKey, BatchGroupProposal, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchGroupStableKey {
        pub batch_group_id: BatchGroupId,
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchGroupStableEncodingChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchGroupProposalStableKey {
        pub batch_group_id: BatchGroupId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct BatchGroupProposal {
        pub evidence: Hash,
        pub status: BatchGroupProposalStatus,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub enum BatchGroupProposalStatus {
        Open,
        Rejected,
        Accepted,
        Executed,
        Failed,
    }
}
