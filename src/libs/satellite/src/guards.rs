use crate::controllers::store::get_controllers;
use crate::errors::auth::{JUNO_ERROR_AUTH_NOT_ADMIN_CONTROLLER, JUNO_ERROR_AUTH_NOT_CONTROLLER};
use ic_cdk::caller;
use junobuild_shared::controllers::{is_admin_controller, is_controller};
use junobuild_shared::types::state::Controllers;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = get_controllers();

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_ERROR_AUTH_NOT_ADMIN_CONTROLLER.to_string())
    }
}

pub fn caller_is_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = get_controllers();

    if is_controller(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_ERROR_AUTH_NOT_CONTROLLER.to_string())
    }
}
