use crate::memory::internal::STATE;
use crate::types::state::{RuntimeState, State};

fn read_state<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with(|cell| f(&cell.borrow()))
}

fn mutate_state<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with(|cell| f(&mut cell.borrow_mut()))
}

pub fn read_runtime_state<R>(f: impl FnOnce(&RuntimeState) -> R) -> R {
    read_state(|state| f(&state.runtime))
}

pub fn mutate_runtime_state<R>(f: impl FnOnce(&mut RuntimeState) -> R) -> R {
    mutate_state(|state| f(&mut state.runtime))
}
