use crate::memory::manager::RUNTIME_STATE;
use crate::types::runtime::RuntimeState;

pub fn start_scheduler() {
    RUNTIME_STATE.with(|state| start_scheduler_impl(&mut state.borrow_mut()))
}

pub fn stop_scheduler() {
    RUNTIME_STATE.with(|state| stop_scheduler_impl(&mut state.borrow_mut()))
}

pub fn reset_scheduler() {
    RUNTIME_STATE.with(|state| reset_funding_manager_impl(&mut state.borrow_mut()))
}

pub fn assert_scheduler_running() -> Result<(), String> {
    RUNTIME_STATE.with(|state| assert_scheduler_running_impl(&mut state.borrow_mut()))
}

pub fn assert_scheduler_stopped() -> Result<(), String> {
    RUNTIME_STATE.with(|state| assert_scheduler_stopped_impl(&mut state.borrow_mut()))
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

fn reset_funding_manager_impl(state: &mut RuntimeState) {
    state.fund_manager = None
}

fn assert_scheduler_running_impl(state: &mut RuntimeState) -> Result<(), String> {
    if let Some(fund_manager) = &mut state.fund_manager {
        if !fund_manager.is_running() {
            return Err("Monitoring is stopped.".to_string());
        }
    }

    Ok(())
}

fn assert_scheduler_stopped_impl(state: &mut RuntimeState) -> Result<(), String> {
    if let Some(fund_manager) = &mut state.fund_manager {
        if fund_manager.is_running() {
            return Err("Monitoring is currently running.".to_string());
        }
    }

    Ok(())
}
