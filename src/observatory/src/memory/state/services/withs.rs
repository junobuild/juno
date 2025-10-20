use crate::memory::state::services::{mutate_runtime_state, read_heap_state};
use junobuild_shared::types::state::Controllers;
use rand::prelude::StdRng;

pub fn with_runtime_rng_mut<R>(f: impl FnOnce(&mut Option<StdRng>) -> R) -> R {
    mutate_runtime_state(|state| f(&mut state.rng))
}

pub fn with_controllers<R>(f: impl FnOnce(&Controllers) -> R) -> R {
    read_heap_state(|heap| f(&heap.controllers))
}
