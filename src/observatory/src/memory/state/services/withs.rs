use crate::memory::state::services::{mutate_heap_state, mutate_runtime_state, read_heap_state};
use crate::types::state::OpenId;
use junobuild_shared::types::state::Controllers;
use rand::prelude::StdRng;

pub fn with_runtime_rng_mut<R>(f: impl FnOnce(&mut Option<StdRng>) -> R) -> R {
    mutate_runtime_state(|state| f(&mut state.rng))
}

pub fn with_controllers<R>(f: impl FnOnce(&Controllers) -> R) -> R {
    read_heap_state(|heap| f(&heap.controllers))
}

pub fn with_openid<R>(f: impl FnOnce(&Option<OpenId>) -> R) -> R {
    read_heap_state(|heap| f(&heap.openid))
}

pub fn with_openid_mut<R>(f: impl FnOnce(&mut Option<OpenId>) -> R) -> R {
    mutate_heap_state(|heap| f(&mut heap.openid))
}
