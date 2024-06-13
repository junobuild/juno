pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::{Blob, CollectionKey};
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::runtime_state::BatchId;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;

    pub type BatchAssetsStable = StableBTreeMap<BatchStableKey, Asset, Memory>;
    pub type BatchContentChunksStable = StableBTreeMap<BatchStableEncodingChunkKey, Blob, Memory>;

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
}
