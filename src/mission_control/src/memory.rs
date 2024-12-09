use crate::types::runtime::RuntimeState;
use crate::types::state::State;
use std::cell::RefCell;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    pub static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}

pub fn init_runtime_state() {
    RUNTIME_STATE.with(|state| *state.borrow_mut() = RuntimeState::default());
}
