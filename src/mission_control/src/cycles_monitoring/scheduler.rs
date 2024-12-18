use crate::memory::RUNTIME_STATE;
use crate::types::runtime::RuntimeState;

pub fn start_scheduler() {
    RUNTIME_STATE.with(|state| start_scheduler_impl(&mut state.borrow_mut()))
}

pub fn stop_scheduler() {
    RUNTIME_STATE.with(|state| stop_scheduler_impl(&mut state.borrow_mut()))
}

fn start_scheduler_impl(state: &mut RuntimeState) {
    if let Some(fund_manager) = &mut state.fund_manager {
        if !fund_manager.is_running() {
            fund_manager.start();
        }
    }
}

fn stop_scheduler_impl(state: &mut RuntimeState) {
    if let Some(fund_manager) = &mut state.fund_manager {
        if fund_manager.is_running() && fund_manager.get_canisters().is_empty() {
            fund_manager.stop();
        }
    }
}