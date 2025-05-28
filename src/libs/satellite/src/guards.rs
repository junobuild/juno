use crate::controllers::store::get_controllers;
use crate::errors::auth::{JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER, JUNO_AUTH_ERROR_NOT_CONTROLLER};
use ic_cdk::caller;
use junobuild_shared::controllers::{is_admin_controller, is_write_controller};
use junobuild_shared::types::state::Controllers;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = get_controllers();

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER.to_string())
    }
}

pub fn caller_is_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = get_controllers();

    if is_write_controller(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_AUTH_ERROR_NOT_CONTROLLER.to_string())
    }
}
