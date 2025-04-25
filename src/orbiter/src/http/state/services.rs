use crate::http::state::memory::RUNTIME_STATE;
use crate::http::state::types::RuntimeState;

pub fn read_state<R>(f: impl FnOnce(&RuntimeState) -> R) -> R {
    RUNTIME_STATE.with(|cell| f(&cell.borrow()))
}

pub fn mutate_state<R>(f: impl FnOnce(&mut RuntimeState) -> R) -> R {
    RUNTIME_STATE.with(|cell| f(&mut cell.borrow_mut()))
}
