use crate::memory::manager::STATE;
use crate::types::state::{HeapState, StableState, State};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

fn read_state<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with(|cell| f(&cell.borrow()))
}

fn mutate_state<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with(|cell| f(&mut cell.borrow_mut()))
}

pub fn read_heap_state<R>(f: impl FnOnce(&HeapState) -> R) -> R {
    read_state(|state| f(&state.heap))
}

pub fn mutate_heap_state<R>(f: impl FnOnce(&mut HeapState) -> R) -> R {
    mutate_state(|state| f(&mut state.heap))
}

pub fn read_stable_state<R>(f: impl FnOnce(&StableState) -> R) -> R {
    read_state(|state| f(&state.stable))
}

pub fn mutate_stable_state<R>(f: impl FnOnce(&mut StableState) -> R) -> R {
    mutate_state(|state| f(&mut state.stable))
}

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
