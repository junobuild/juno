mod guards;
mod store;
mod types;

use crate::guards::{caller_can_read, caller_is_console, caller_is_controller};
use crate::store::{
    delete_controllers, delete_readonly_controllers, set_controllers as set_controllers_store,
    set_notifications as set_notifications_store,
    set_readonly_controllers as set_readonly_controllers_store,
};
use crate::types::state::{StableState, State};
use candid::{candid_method, export_service};
use ic_cdk::caller;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use shared::controllers::init_controllers;
use shared::types::interface::{DeleteControllersArgs, SetControllersArgs, SetNotificationsArgs};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

#[init]
fn init() {
    let manager = caller();

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: StableState {
                controllers: init_controllers(&[manager]),
                readonly_controllers: HashMap::new(),
                notifications: HashMap::new(),
            },
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| stable_save((&state.borrow().stable,)).unwrap());
}

#[post_upgrade]
fn post_upgrade() {
    let (stable,): (StableState,) = stable_restore().unwrap();

    STATE.with(|state| *state.borrow_mut() = State { stable });
}

/// Controllers

#[candid_method(update)]
#[update(guard = "caller_is_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_controllers_store(&controllers, &controller);
}

#[candid_method(update)]
#[update(guard = "caller_is_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_controllers(&controllers);
}

#[candid_method(update)]
#[update(guard = "caller_is_controller")]
fn set_readonly_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_readonly_controllers_store(&controllers, &controller);
}

#[candid_method(update)]
#[update(guard = "caller_is_controller")]
fn del_readonly_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_readonly_controllers(&controllers);
}

/// Notifications

#[candid_method(update)]
#[update(guard = "caller_is_console")]
pub fn set_notifications(
    SetNotificationsArgs {
        mission_control_id,
        config,
    }: SetNotificationsArgs,
) {
    set_notifications_store(&mission_control_id, &config);
}

/// Mgmt

#[candid_method(query)]
#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

///
/// Generate did files
///

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let dir = dir
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("src")
            .join("observatory");
        write(dir.join("observatory.did"), export_candid()).expect("Write failed.");
    }
}
