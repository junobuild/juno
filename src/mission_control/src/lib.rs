mod constants;
mod controllers;
mod guards;
mod impls;
mod mgmt;
mod satellites;
mod store;
mod types;
mod upgrade;

use crate::controllers::mission_control::{
    delete_mission_control_controllers as delete_controllers_to_mission_control,
    set_mission_control_controllers as set_controllers_to_mission_control,
};
use crate::controllers::satellite::{
    add_satellite_controllers as add_satellite_controllers_impl, delete_satellite_controllers,
    remove_satellite_controllers as remove_satellite_controllers_impl, set_satellite_controllers,
};
use crate::controllers::store::get_controllers;
use crate::guards::{
    caller_is_user_or_admin_controller, caller_is_user_or_admin_controller_or_juno,
};
use crate::mgmt::canister::top_up_canister;
use crate::mgmt::status::collect_statuses;
use crate::satellites::satellite::create_satellite as create_satellite_console;
use crate::store::{
    get_user as get_user_store,
    list_mission_control_statuses as list_mission_control_statuses_store,
    list_satellite_statuses as list_satellite_statuses_store, set_metadata as set_metadata_store,
};
use crate::types::state::{Archive, Satellite, Satellites, StableState, State, Statuses, User};
use crate::upgrade::types::upgrade::UpgradeStableState;
use candid::Principal;
use ic_cdk::api::call::arg_data;
use ic_cdk::{id, storage, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::Tokens;
use satellites::store::{get_satellites, set_satellite_metadata as set_satellite_metadata_store, attach_satellite as attach_satellite_store};
use shared::types::interface::{MissionControlArgs, SetController, StatusesArgs};
use shared::types::state::{
    ControllerId, ControllerScope, Controllers, SatelliteId, SegmentsStatuses,
};
use shared::types::state::{Metadata, UserId};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

#[init]
fn init() {
    let call_arg = arg_data::<(Option<MissionControlArgs>,)>().0;
    let user = call_arg.unwrap().user;

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: StableState {
                user: User::from(&user),
                satellites: HashMap::new(),
                controllers: HashMap::new(),
                archive: Archive::new(),
            },
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| storage::stable_save((&state.borrow().stable,)).unwrap());
}

#[post_upgrade]
fn post_upgrade() {
    let (upgrade_stable,): (UpgradeStableState,) = storage::stable_restore().unwrap();

    let stable = StableState::from(&upgrade_stable);

    STATE.with(|state| *state.borrow_mut() = State { stable });
}

/// Satellites

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_satellites() -> Satellites {
    get_satellites()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn create_satellite(name: String) -> Satellite {
    create_satellite_console(&name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn attach_satellite(satellite_id: SatelliteId, metadata: Metadata) -> Satellite {
    attach_satellite_store(&satellite_id, &metadata).unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_satellite_metadata(satellite_id: SatelliteId, metadata: Metadata) -> Satellite {
    set_satellite_metadata_store(&satellite_id, &metadata).unwrap_or_else(|e| trap(&e))
}

#[deprecated(
    since = "0.0.3",
    note = "please use `set_satellites_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn add_satellites_controllers(
    satellite_ids: Vec<SatelliteId>,
    controllers: Vec<ControllerId>,
) {
    for satellite_id in satellite_ids {
        add_satellite_controllers_impl(&satellite_id, &controllers)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[deprecated(
    since = "0.0.3",
    note = "please use `del_satellites_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn remove_satellites_controllers(
    satellite_ids: Vec<SatelliteId>,
    controllers: Vec<ControllerId>,
) {
    for satellite_id in satellite_ids {
        remove_satellite_controllers_impl(&satellite_id, &controllers)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_satellites_controllers(
    satellite_ids: Vec<SatelliteId>,
    controller_ids: Vec<ControllerId>,
    controller: SetController,
) {
    for satellite_id in satellite_ids {
        set_satellite_controllers(&satellite_id, &controller_ids, &controller)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_satellites_controllers(satellite_ids: Vec<SatelliteId>, controllers: Vec<UserId>) {
    for satellite_id in satellite_ids {
        delete_satellite_controllers(&satellite_id, &controllers)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

/// Mgmt
///

#[update(guard = "caller_is_user_or_admin_controller")]
async fn top_up(canister_id: Principal, amount: Tokens) {
    top_up_canister(&canister_id, &amount)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_user() -> UserId {
    get_user_store()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_metadata(metadata: Metadata) {
    set_metadata_store(&metadata)
}

///
/// Controllers
///

#[deprecated(
    since = "0.0.3",
    note = "please use `set_mission_control_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn add_mission_control_controllers(controllers: Vec<UserId>) {
    let controller: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
        scope: ControllerScope::Admin,
    };

    set_controllers_to_mission_control(&controllers, &controller)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[deprecated(
    since = "0.0.3",
    note = "please use `del_mission_control_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn remove_mission_control_controllers(controllers: Vec<ControllerId>) {
    delete_controllers_to_mission_control(&controllers)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_mission_control_controllers(
    controllers: Vec<ControllerId>,
    controller: SetController,
) {
    set_controllers_to_mission_control(&controllers, &controller)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_mission_control_controllers(controllers: Vec<ControllerId>) {
    delete_controllers_to_mission_control(&controllers)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_mission_control_controllers() -> Controllers {
    get_controllers()
}

///
/// Mgmt
///

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[update(guard = "caller_is_user_or_admin_controller_or_juno")]
async fn status(config: StatusesArgs) -> SegmentsStatuses {
    collect_statuses(&id(), &config).await
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_mission_control_statuses() -> Statuses {
    list_mission_control_statuses_store()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_satellite_statuses(satellite_id: SatelliteId) -> Option<Statuses> {
    list_satellite_statuses_store(&satellite_id)
}

// Generate did files

export_candid!();
