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
        Err("Caller is not a controller of the satellite.".to_string())
    }
}
