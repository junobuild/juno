pub mod state {
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::core::Blob;
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::{Deserialize, Serialize};

    pub type AssetsStable = StableBTreeMap<StableKey, Asset, Memory>;
    pub type ContentChunksStable = StableBTreeMap<StableEncodingChunkKey, Blob, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableKey {
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableEncodingChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }
}
