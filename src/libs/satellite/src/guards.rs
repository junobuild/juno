use crate::controllers::store::get_controllers;
use ic_cdk::caller;
use junobuild_shared::controllers::{is_admin_controller, is_controller};
use junobuild_shared::types::state::Controllers;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = get_controllers();

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not an admin controller of the satellite.".to_string())
    }
}

pub fn caller_is_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = get_controllers();

    if is_controller(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not a controller of the satellite.".to_string())
    }
}
