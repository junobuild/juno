use crate::memory::state::STATE;
use crate::types::state::{RuntimeState, State};

fn mutate_state<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with(|cell| f(&mut cell.borrow_mut()))
}

pub fn mutate_runtime_state<R>(f: impl FnOnce(&mut RuntimeState) -> R) -> R {
    mutate_state(|state| f(&mut state.runtime))
}
