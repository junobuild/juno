use crate::memory::state::services::mutate_runtime_state;
use rand::prelude::StdRng;

pub fn with_runtime_rng_mut<R>(f: impl FnOnce(&mut Option<StdRng>) -> R) -> R {
    mutate_runtime_state(|state| f(&mut state.rng))
}
