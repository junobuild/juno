use crate::memory::state::STATE;
use crate::types::state::{HeapState, RuntimeState, State};

fn read_state<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with(|cell| f(&cell.borrow()))
}

fn mutate_state<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with(|cell| f(&mut cell.borrow_mut()))
}

pub fn mutate_runtime_state<R>(f: impl FnOnce(&mut RuntimeState) -> R) -> R {
    mutate_state(|state| f(&mut state.runtime))
}

pub fn read_heap_state<R>(f: impl FnOnce(&HeapState) -> R) -> R {
    read_state(|state| f(&state.heap))
}

pub fn mutate_heap_state<R>(f: impl FnOnce(&mut HeapState) -> R) -> R {
    mutate_state(|state| f(&mut state.heap))
}
