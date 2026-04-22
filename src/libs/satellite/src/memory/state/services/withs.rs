use crate::memory::state::services::{mutate_heap_state, mutate_runtime_state, read_heap_state};
use junobuild_collections::types::rules::Rules;
use rand::prelude::StdRng;

pub fn with_db_rules<R>(f: impl FnOnce(&Rules) -> R) -> R {
    read_heap_state(|state| {
        let db = &state.db;
        f(&db.rules)
    })
}

pub fn with_storage_rules<R>(f: impl FnOnce(&Rules) -> R) -> R {
    read_heap_state(|state| {
        let storage = &state.storage;
        f(&storage.rules)
    })
}

pub fn with_db_rules_mut<R>(f: impl FnOnce(&mut Rules) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.db.rules))
}

pub fn with_storage_rules_mut<R>(f: impl FnOnce(&mut Rules) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.storage.rules))
}

pub fn with_runtime_rng_mut<R>(f: impl FnOnce(&mut Option<StdRng>) -> R) -> R {
    mutate_runtime_state(|state| f(&mut state.rng))
}
