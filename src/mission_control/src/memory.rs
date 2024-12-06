use crate::types::state::State;
use canfund::FundManager;
use std::cell::RefCell;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    pub static FUND_MANAGER: RefCell<FundManager> = RefCell::new(FundManager::new());
}
