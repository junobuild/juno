pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::core::{Blob, CollectionKey};
    use junobuild_shared::types::memory::Memory;
    use junobuild_storage::types::runtime_state::BatchGroupId;
    use junobuild_storage::types::state::FullPath;
    use junobuild_storage::types::store::{Asset, EncodingType};
    use serde::Serialize;

    pub type BatchGroupAssetsStable = StableBTreeMap<BatchGroupStableKey, Asset, Memory>;
    pub type BatchGroupContentChunksStable =
        StableBTreeMap<BatchGroupStableEncodingChunkKey, Blob, Memory>;

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
}
