use crate::store::services::raw::{mutate_heap_state, read_heap_state};
use junobuild_auth::types::state::AuthenticationHeapState;
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

pub fn with_auth<R>(f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
    read_heap_state(|state| {
        let authentication = &state.authentication;
        f(&authentication)
    })
}

pub fn with_auth_mut<R>(f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.authentication))
}
