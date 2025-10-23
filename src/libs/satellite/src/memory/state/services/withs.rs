use crate::memory::state::services::{mutate_heap_state, mutate_runtime_state, read_heap_state};
use junobuild_auth::state::types::state::AuthenticationHeapState;
use rand::prelude::StdRng;

pub fn with_runtime_rng_mut<R>(f: impl FnOnce(&mut Option<StdRng>) -> R) -> R {
    mutate_runtime_state(|state| f(&mut state.rng))
}

pub fn with_heap_authentication<R>(f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
    read_heap_state(|heap| f(&heap.authentication))
}

pub fn with_heap_authentication_mut<R>(
    f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
) -> R {
    mutate_heap_state(|heap| f(&mut heap.authentication))
}
