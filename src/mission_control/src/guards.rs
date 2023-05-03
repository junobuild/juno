use crate::store::get_user;
use crate::STATE;
use ic_cdk::caller;
use shared::controllers::{caller_is_console, caller_is_observatory, is_admin_controller};
use shared::types::state::Controllers;
use shared::utils::principal_equal;

pub fn caller_is_user_or_admin_controller() -> Result<(), String> {
    if caller_is_user() || caller_is_admin_controller() {
        Ok(())
    } else {
        Err("Caller is not the owner or a controller of the mission control.".to_string())
    }
}

pub fn caller_is_user_or_admin_controller_or_juno() -> Result<(), String> {
    let caller = caller();

    if caller_is_user()
        || caller_is_admin_controller()
        || caller_is_console(caller)
        || caller_is_observatory(caller)
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

fn caller_is_admin_controller() -> bool {
    let caller = caller();
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    is_admin_controller(caller, &controllers)
}
