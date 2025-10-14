use crate::memory::services::{mutate_runtime_state, read_runtime_state};
use rand::prelude::StdRng;

pub fn with_runtime_rng<R>(f: impl FnOnce(&Option<StdRng>) -> R) -> R {
    read_runtime_state(|state| {
        let rng = &state.rng;
        f(&rng)
    })
}

pub fn with_runtime_rng_mut<R>(f: impl FnOnce(&mut Option<StdRng>) -> R) -> R {
    mutate_runtime_state(|state| f(&mut state.rng))
}
