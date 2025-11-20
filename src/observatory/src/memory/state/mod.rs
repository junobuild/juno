use crate::types::runtime::RuntimeState;
use crate::types::state::State;
use std::cell::RefCell;

pub mod services;

thread_local! {
    pub(super) static STATE: RefCell<State> = RefCell::default();

    static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}
