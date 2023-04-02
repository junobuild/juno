use crate::store::get_user;
use crate::STATE;
use candid::Principal;
use ic_cdk::caller;
use shared::controllers::is_controller;
use shared::env::{CONSOLE, OBSERVATORY};
use shared::types::state::Controllers;
use shared::utils::principal_equal;

pub fn caller_is_user_or_controller() -> Result<(), String> {
    if caller_is_user() || caller_is_controller() {
        Ok(())
    } else {
        Err("Caller is not the owner or a controller of the mission control.".to_string())
    }
}

pub fn caller_can_read() -> Result<(), String> {
    if caller_is_user() || caller_is_controller() || caller_is_console() || caller_is_observatory()
    {
        Ok(())
    } else {
        Err(
            "Caller has no read permission for selected function of the mission control."
                .to_string(),
        )
    }
}

fn caller_is_user() -> bool {
    let caller = caller();
    let user = get_user();

    principal_equal(caller, user)
}

fn caller_is_controller() -> bool {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    is_controller(caller, &controllers)
}

fn caller_is_console() -> bool {
    let caller = caller();
    let console = Principal::from_text(CONSOLE).unwrap();

    principal_equal(caller, console)
}

fn caller_is_observatory() -> bool {
    let caller = caller();
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    principal_equal(caller, observatory)
}
