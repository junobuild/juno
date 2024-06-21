pub mod state {
    use crate::types::state::ProposalId;
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::core::Blob;
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;

    pub type AssetsStable = StableBTreeMap<AssetKey, Asset, Memory>;
    pub type ContentChunksStable = StableBTreeMap<ContentChunkKey, Blob, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct AssetKey {
        pub proposal_id: ProposalId,
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct ContentChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }
}
