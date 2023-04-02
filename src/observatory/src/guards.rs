use crate::STATE;
use candid::Principal;
use ic_cdk::caller;
use shared::controllers::{
    caller_is_console as caller_is_console_impl, is_controller as is_controller_impl,
};
use shared::env::CONSOLE;
use shared::types::state::Controllers;
use shared::utils::principal_equal;

pub fn caller_is_console() -> Result<(), String> {
    let caller = caller();
    let console = Principal::from_text(CONSOLE).unwrap();

    if principal_equal(caller, console) {
        Ok(())
    } else {
        Err("Caller is not the console.".to_string())
    }
}

pub fn caller_is_controller() -> Result<(), String> {
    if is_controller() {
        Ok(())
    } else {
        Err("Caller is not a controller of the observatory.".to_string())
    }
}

pub fn caller_can_execute_cron_jobs() -> Result<(), String> {
    let caller = caller();

    if caller_is_console_impl(caller) || is_controller() || caller_is_cron_jobs_controller() {
        Ok(())
    } else {
        Err("Caller is not allowed to read.".to_string())
    }
}

fn caller_is_cron_jobs_controller() -> bool {
    let caller = caller();
    let controllers: Controllers =
        STATE.with(|state| state.borrow().stable.cron_jobs_controllers.clone());

    is_controller_impl(caller, &controllers)
}

fn is_controller() -> bool {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    is_controller_impl(caller, &controllers)
}
