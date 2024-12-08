use crate::memory::RUNTIME_STATE;
use crate::types::runtime::RuntimeState;
use candid::Principal;

pub fn register_monitoring(id: &Principal) {
    RUNTIME_STATE.with(|state| register_monitoring_impl(id, &mut state.borrow_mut()));
}

fn register_monitoring_impl(id: &Principal, state: &mut RuntimeState) {
    // TODO
    // fund_manager.register(id.clone(), RegisterOpts::new());
}
