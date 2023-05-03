use crate::STATE;
use candid::Principal;
use ic_cdk::caller;
use shared::controllers::is_admin_controller;
use shared::env::OBSERVATORY;
use shared::types::state::Controllers;
use shared::utils::principal_equal;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

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
