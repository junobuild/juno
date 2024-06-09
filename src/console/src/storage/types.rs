use junobuild_shared::types::core::CollectionKey;

pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::Blob;
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::config::StorageConfig;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;
    use std::collections::HashMap;

    pub type BatchAssetsStable = StableBTreeMap<BatchStableKey, Asset, Memory>;
    pub type BatchContentChunksStable = StableBTreeMap<StableEncodingChunkKey, Blob, Memory>;

    pub type AssetsHeap = HashMap<FullPath, Asset>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchStableKey {
        pub batch_id: u128,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableEncodingChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageHeapState {
        pub assets: AssetsHeap,
        pub config: StorageConfig,
        // TODO: custom domain
    }
}
