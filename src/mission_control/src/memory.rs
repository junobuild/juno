use crate::types::state::State;
use std::cell::RefCell;
use canfund::FundManager;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    pub static FUND_MANAGER: RefCell<FundManager> = RefCell::new(FundManager::new());
}
