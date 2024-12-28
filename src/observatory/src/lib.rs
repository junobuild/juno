mod console;
mod guards;
mod store;
mod types;
mod upgrade;

use crate::guards::caller_is_admin_controller;
use crate::store::{delete_controllers, set_controllers as set_controllers_store};
use crate::types::state::{StableState, State};
use crate::upgrade::types::upgrade::UpgradeStableState;
use ic_cdk::caller;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use junobuild_shared::controllers::init_controllers;
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use std::cell::RefCell;

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
    let (upgrade_stable,): (UpgradeStableState,) = stable_restore().unwrap();

    let stable = StableState::from(&upgrade_stable);

    STATE.with(|state| *state.borrow_mut() = State { stable });
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_controllers_store(&controllers, &controller);
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_controllers(&controllers);
}

// ---------------------------------------------------------
// Mgmt
// ---------------------------------------------------------

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Generate did files

export_candid!();
