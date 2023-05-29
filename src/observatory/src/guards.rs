use crate::memory::CONTROLLERS_STATE;
use ic_cdk::caller;
use shared::controllers::{
    caller_is_console as caller_is_console_impl,
    is_stable_admin_controller as is_admin_controller_impl,
    is_stable_controller as is_controller_impl,
};
use shared::types::state::{Controller, StableControllerId};

pub fn caller_is_admin_controller() -> Result<(), String> {
    if is_admin_controller() {
        Ok(())
    } else {
        Err("Caller is not a controller of the observatory.".to_string())
    }
}

pub fn caller_can_execute_cron_jobs() -> Result<(), String> {
    let caller = caller();

    if caller_is_console_impl(caller) || caller_is_controller() {
        Ok(())
    } else {
        Err("Caller is not allowed to read.".to_string())
    }
}

fn caller_is_controller() -> bool {
    let caller = caller();
    let controllers: Vec<(StableControllerId, Controller)> =
        CONTROLLERS_STATE.with(|state| state.borrow().iter().collect());

    is_controller_impl(caller, &controllers)
}

fn is_admin_controller() -> bool {
    let caller = caller();
    let controllers: Vec<(StableControllerId, Controller)> =
        CONTROLLERS_STATE.with(|state| state.borrow().iter().collect());

    is_admin_controller_impl(caller, &controllers)
}
