use crate::memory::STATE;
use crate::store::get_user;
use ic_cdk::api::is_controller as ic_canister_controller;
use ic_cdk::caller;
use junobuild_shared::controllers::is_admin_controller;
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::principal_equal;

pub fn caller_is_user_or_admin_controller() -> Result<(), String> {
    if caller_is_user() || caller_is_admin_controller() {
        Ok(())
    } else {
        Err("Caller is not the owner or a controller of the mission control.".to_string())
    }
}

fn caller_is_user() -> bool {
    let caller = caller();
    let user = get_user();

    principal_equal(caller, user) && ic_canister_controller(&caller)
}

fn caller_is_admin_controller() -> bool {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    is_admin_controller(caller, &controllers)
}
