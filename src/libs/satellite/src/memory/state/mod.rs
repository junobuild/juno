use crate::types::state::State;
use std::cell::RefCell;

pub mod services;

thread_local! {
    pub(crate) static STATE: RefCell<State> = RefCell::default();
}
