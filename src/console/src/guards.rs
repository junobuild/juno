use crate::store::increment_satellites_rate;
use crate::STATE;
use ic_cdk::caller;
use shared::controllers::is_controller;
use shared::types::interface::Controllers;

pub fn caller_is_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    if is_controller(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not a controller of the console.".to_string())
    }
}

pub fn satellites_rate_is_not_exceeded() -> Result<(), String> {
    increment_satellites_rate()
}
