use crate::state::types::runtime_state::State;
use std::cell::RefCell;

thread_local! {
    pub(super) static STATE: RefCell<State> = RefCell::default();
}
