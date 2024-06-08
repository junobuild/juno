use std::cell::RefCell;
use crate::types::state::State;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();
}