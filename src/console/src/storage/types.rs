pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::{Blob, CollectionKey, Hash};
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::runtime_state::BatchGroupId;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;

    pub type ProposalAssetsStable = StableBTreeMap<ProposalAssetKey, Asset, Memory>;
    pub type ProposalContentChunksStable = StableBTreeMap<ProposalContentChunkKey, Blob, Memory>;
    pub type ProposalsStable = StableBTreeMap<ProposalKey, Proposal, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct ProposalAssetKey {
        pub batch_group_id: BatchGroupId,
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct ProposalContentChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct ProposalKey {
        pub batch_group_id: BatchGroupId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Proposal {
        pub evidence: Hash,
        pub status: ProposalStatus,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub enum ProposalStatus {
        Open,
        Rejected,
        Accepted,
        Executed,
        Failed,
    }
}
