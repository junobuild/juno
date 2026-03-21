use crate::state::memory::manager::STATE;
use junobuild_shared::ic::api::caller;
use junobuild_shared::segments::access_keys::{is_admin_controller, is_write_access_key};
use junobuild_shared::types::state::AccessKeys;

pub fn caller_is_admin_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: AccessKeys = STATE.with(|state| state.borrow().heap.controllers.clone());

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not an admin controller of the orbiter.".to_string())
    }
}

pub fn caller_is_controller() -> Result<(), String> {
    let caller = caller();
    let controllers: AccessKeys = STATE.with(|state| state.borrow().heap.controllers.clone());

    if is_write_access_key(caller, &controllers) {
        Ok(())
    } else {
        Err("Caller is not a controller of the orbiter.".to_string())
    }
}
