use crate::memory::manager::STATE;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

pub fn with_assets<R>(f: impl FnOnce(&AssetsHeap) -> R) -> R {
    STATE.with(|state| {
        let storage = &state.borrow().heap.storage;
        f(&storage.assets)
    })
}

pub fn with_assets_mut<R>(f: impl FnOnce(&mut AssetsHeap) -> R) -> R {
    STATE.with(|state| {
        let mut borrow = state.borrow_mut();
        f(&mut borrow.heap.storage.assets)
    })
}

pub fn with_config<R>(f: impl FnOnce(&StorageConfig) -> R) -> R {
    STATE.with(|state| {
        let storage = &state.borrow().heap.storage;
        f(&storage.config)
    })
}
