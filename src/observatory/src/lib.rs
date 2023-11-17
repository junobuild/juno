mod console;
mod constants;
mod cron_jobs;
mod guards;
mod reports;
mod store;
mod types;

use crate::console::assert_mission_control_center;
use crate::constants::CRON_INTERVAL_NS;
use crate::cron_jobs::cron_jobs;
use crate::guards::{caller_can_execute_cron_jobs, caller_is_admin_controller};
use crate::reports::collect_statuses as collect_statuses_report;
use crate::store::{
    delete_controllers, get_cron_tab as get_cron_tab_store, get_statuses as get_statuses_store,
    set_controllers as set_controllers_store, set_cron_tab as set_cron_tab_store,
};
use crate::types::interface::{ListStatuses, ListStatusesArgs, SetCronTab};
use crate::types::state::{Archive, ArchiveStatuses, CronTab, StableState, State};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk::{caller, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_cdk_timers::set_timer_interval;
use shared::controllers::init_controllers;
use shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
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

/// Crontabs

#[update]
async fn set_cron_tab(cron_tab: SetCronTab) -> CronTab {
    let user = caller();

    assert_mission_control_center(&user, &cron_tab.mission_control_id)
        .await
        .unwrap_or_else(|e| trap(&e));

    set_cron_tab_store(&user, &cron_tab).unwrap_or_else(|e| trap(&e))
}

#[query]
fn get_cron_tab() -> Option<CronTab> {
    let user = caller();
    get_cron_tab_store(&user)
}

/// Statuses

#[query]
fn get_statuses() -> Option<ArchiveStatuses> {
    let user = caller();
    get_statuses_store(&user)
}

/// Reports

#[query(guard = "caller_can_execute_cron_jobs")]
fn list_statuses(args: ListStatusesArgs) -> Vec<ListStatuses> {
    collect_statuses_report(&args)
}

/// Mgmt

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Generate did files

export_candid!();
