use crate::state::types::state::State;
use std::cell::RefCell;

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

pub fn read_state<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with(|cell| f(&cell.borrow()))
}

pub fn mutate_state<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with(|cell| f(&mut cell.borrow_mut()))
}
