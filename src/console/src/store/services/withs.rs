use crate::store::services::raw::{mutate_heap_state, read_heap_state};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

pub fn with_assets<R>(f: impl FnOnce(&AssetsHeap) -> R) -> R {
    read_heap_state(|state| {
        let storage = &state.storage;
        f(&storage.assets)
    })
}

pub fn with_assets_mut<R>(f: impl FnOnce(&mut AssetsHeap) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.storage.assets))
}

pub fn with_config<R>(f: impl FnOnce(&StorageConfig) -> R) -> R {
    read_heap_state(|state| {
        let storage = &state.storage;
        f(&storage.config)
    })
}
