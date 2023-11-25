mod constants;
mod controllers;
mod guards;
mod impls;
mod mgmt;
mod segments;
mod store;
mod types;

use crate::controllers::mission_control::{
    delete_mission_control_controllers as delete_controllers_to_mission_control,
    set_mission_control_controllers as set_controllers_to_mission_control,
};
use crate::controllers::orbiter::{delete_orbiter_controllers, set_orbiter_controllers};
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
use crate::segments::orbiter::{
    attach_orbiter, create_orbiter as create_orbiter_console, delete_orbiter,
};
use crate::segments::satellite::{create_satellite as create_satellite_console, delete_satellite};
use crate::segments::store::get_orbiters;
use crate::store::{
    get_user as get_user_store,
    list_mission_control_statuses as list_mission_control_statuses_store,
    list_orbiter_statuses as list_orbiter_statuses_store,
    list_satellite_statuses as list_satellite_statuses_store, set_metadata as set_metadata_store,
};
use crate::types::state::{
    Archive, Orbiter, Orbiters, Satellite, Satellites, StableState, State, Statuses, User,
};
use candid::Principal;
use ic_cdk::api::call::arg_data;
use ic_cdk::{id, storage, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::Tokens;
use segments::store::{
    get_satellites, set_orbiter_metadata as set_orbiter_metadata_store,
    set_satellite_metadata as set_satellite_metadata_store,
};
use shared::ic::deposit_cycles as deposit_cycles_shared;
use shared::types::interface::{
    DepositCyclesArgs, MissionControlArgs, SetController, StatusesArgs,
};
use shared::types::state::{
    ControllerId, ControllerScope, Controllers, OrbiterId, SatelliteId, SegmentsStatuses,
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
                orbiters: Orbiters::new(),
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
    let (stable,): (StableState,) = storage::stable_restore().unwrap();

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

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_satellite(satellite_id: SatelliteId, cycles_to_deposit: u128) {
    delete_satellite(&satellite_id, cycles_to_deposit)
        .await
        .unwrap_or_else(|e| trap(&e));
}

/// Orbiters

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_orbiters() -> Orbiters {
    get_orbiters()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn create_orbiter(name: Option<String>) -> Orbiter {
    create_orbiter_console(&name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_orbiter(orbiter_id: OrbiterId, name: Option<String>) -> Orbiter {
    attach_orbiter(&orbiter_id, &name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_orbiter_metadata(orbiter_id: OrbiterId, metadata: Metadata) -> Orbiter {
    set_orbiter_metadata_store(&orbiter_id, &metadata).unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_orbiters_controllers(
    orbiter_ids: Vec<OrbiterId>,
    controller_ids: Vec<ControllerId>,
    controller: SetController,
) {
    for orbiter_id in orbiter_ids {
        set_orbiter_controllers(&orbiter_id, &controller_ids, &controller)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_orbiters_controllers(orbiter_ids: Vec<OrbiterId>, controllers: Vec<UserId>) {
    for orbiter_id in orbiter_ids {
        delete_orbiter_controllers(&orbiter_id, &controllers)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_orbiter(orbiter_id: OrbiterId, cycles_to_deposit: u128) {
    delete_orbiter(&orbiter_id, cycles_to_deposit)
        .await
        .unwrap_or_else(|e| trap(&e));
}

/// Mgmt

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

#[update(guard = "caller_is_user_or_admin_controller")]
async fn deposit_cycles(args: DepositCyclesArgs) {
    deposit_cycles_shared(args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

///
/// Observatory
///

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

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_orbiter_statuses(orbiter_id: OrbiterId) -> Option<Statuses> {
    list_orbiter_statuses_store(&orbiter_id)
}

// Generate did files

export_candid!();
