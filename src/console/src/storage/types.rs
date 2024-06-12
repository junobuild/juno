pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_collections::types::rules::Rules;
    use junobuild_shared::types::core::{Blob, CollectionKey};
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::config::StorageConfig;
    use junobuild_storage::types::state::{BatchId, FullPath};
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;
    use std::collections::HashMap;

    pub type BatchAssetsStable = StableBTreeMap<BatchStableKey, Asset, Memory>;
    pub type BatchContentChunksStable = StableBTreeMap<BatchStableEncodingChunkKey, Blob, Memory>;

    pub type AssetsHeap = HashMap<FullPath, Asset>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchStableKey {
        pub batch_id: BatchId,
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct BatchStableEncodingChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }

    // TODO: extract heap state to storage? including impls?
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageHeapState {
        pub assets: AssetsHeap,
        pub rules: Rules,
        pub config: StorageConfig,
        // TODO: custom domain
    }
}
