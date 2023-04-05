mod cron_jobs;
mod guards;
mod store;
mod types;

use crate::cron_jobs::spawn_mission_controls_cron_jobs;
use crate::guards::{caller_can_execute_cron_jobs, caller_is_console, caller_is_controller};
use crate::store::{
    delete_controllers, delete_cron_controllers, set_controllers as set_controllers_store,
    set_cron_controllers as set_cron_controllers_store, set_cron_jobs as set_cron_jobs_store,
};
use crate::types::state::{RuntimeState, StableState, State};
use candid::{candid_method, export_service};
use ic_cdk::caller;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use shared::controllers::init_controllers;
use shared::types::interface::{DeleteControllersArgs, SetControllersArgs, SetCronJobsArgs};
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
                cron_controllers: HashMap::new(),
                cron_tabs: HashMap::new(),
            },
            runtime: RuntimeState::default(),
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

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable,
            runtime: RuntimeState::default(),
        }
    });
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
fn set_cron_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_cron_controllers_store(&controllers, &controller);
}

#[candid_method(update)]
#[update(guard = "caller_is_controller")]
fn del_cron_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_cron_controllers(&controllers);
}

/// CronJobs

#[candid_method(update)]
#[update(guard = "caller_is_console")]
fn set_cron_jobs(
    SetCronJobsArgs {
        mission_control_id,
        cron_jobs,
    }: SetCronJobsArgs,
) {
    set_cron_jobs_store(&mission_control_id, &cron_jobs);
}

#[candid_method(update)]
#[update(guard = "caller_can_execute_cron_jobs")]
fn spawn_cron_jobs() {
    spawn_mission_controls_cron_jobs();
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
