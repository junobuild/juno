use crate::http::state::types::RuntimeState;
use std::cell::RefCell;

thread_local! {
    pub static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}
