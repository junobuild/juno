use crate::store::heap::get_controllers;
use candid::Principal;
use ic_cdk::caller;
use junobuild_shared::controllers::is_admin_controller;
use junobuild_shared::env::OBSERVATORY;
use junobuild_shared::utils::principal_equal;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers = get_controllers();

    ic_cdk::print("Yolo");

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not a controller of the console.".to_string())
    }
}

pub fn caller_is_observatory() -> Result<(), String> {
    let caller = caller();
    let console = Principal::from_text(OBSERVATORY).unwrap();

    if principal_equal(caller, console) {
        Ok(())
    } else {
        Err("Caller is not the observatory.".to_string())
    }
}
