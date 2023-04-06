mod console;
mod constants;
mod cron_jobs;
mod guards;
mod reports;
mod store;
mod types;

use crate::console::assert_known_mission_control;
use crate::constants::CRON_INTERVAL_NS;
use crate::cron_jobs::cron_jobs;
use crate::guards::{caller_can_execute_cron_jobs, caller_is_controller};
use crate::reports::last_statuses;
use crate::store::{
    delete_controllers, delete_cron_controllers, get_cron_tab as get_cron_tab_store,
    set_controllers as set_controllers_store, set_cron_controllers as set_cron_controllers_store,
    set_cron_tab as set_cron_tab_store,
};
use crate::types::interface::{ListStatuses, SetCronTab};
use crate::types::state::{Archive, CronTab, StableState, State};
use candid::{candid_method, export_service};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk::{caller, trap};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use ic_cdk_timers::set_timer_interval;
use shared::controllers::init_controllers;
use shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use shared::types::state::MissionControlId;
use std::cell::RefCell;
use std::collections::HashMap;
use std::time::Duration;

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
                archive: Archive {
                    statuses: HashMap::new(),
                },
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

    set_timer_interval(Duration::from_nanos(CRON_INTERVAL_NS), || {
        cron_jobs();
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
#[update]
async fn set_cron_tab(cron_tab: SetCronTab) {
    assert_known_mission_control(&cron_tab.mission_control_id)
        .await
        .unwrap_or_else(|e| trap(&e));

    set_cron_tab_store(&cron_tab).unwrap_or_else(|e| trap(&e));
}

#[candid_method(update)]
#[update]
async fn get_cron_tab(mission_control_id: MissionControlId) -> Option<CronTab> {
    assert_known_mission_control(&mission_control_id)
        .await
        .unwrap_or_else(|e| trap(&e));

    get_cron_tab_store(&mission_control_id)
}

/// Reports

#[candid_method(query)]
#[query(guard = "caller_can_execute_cron_jobs")]
fn list_last_statuses() -> Vec<ListStatuses> {
    last_statuses()
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
