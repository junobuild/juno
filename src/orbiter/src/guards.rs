use crate::state::memory::manager::STATE;
use ic_cdk::caller;
use junobuild_shared::controllers::{is_admin_controller, controller_can_write};
use junobuild_shared::types::state::Controllers;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not an admin controller of the orbiter.".to_string())
    }
}

pub fn caller_is_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    if controller_can_write(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not a controller of the orbiter.".to_string())
    }
}
