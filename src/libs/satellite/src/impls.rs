use crate::memory::init_stable_state;
use crate::types::state::{HeapState, RuntimeState, State};

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
            runtime: RuntimeState::default(),
        }
    }
}
