mod constants;
mod controllers;
mod guards;
mod impls;
mod memory;
mod monitoring;
mod random;
mod segments;
mod types;
mod user;

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
use crate::guards::caller_is_user_or_admin_controller;
use crate::memory::{get_memory_upgrades, init_runtime_state, init_stable_state, STATE};
use crate::random::defer_init_random_seed;
use crate::segments::orbiter::{
    attach_orbiter, create_orbiter as create_orbiter_console,
    create_orbiter_with_config as create_orbiter_with_config_console, delete_orbiter,
    detach_orbiter,
};
use crate::segments::satellite::{
    attach_satellite, create_satellite as create_satellite_console,
    create_satellite_with_config as create_satellite_with_config_console, delete_satellite,
    detach_satellite,
};
use crate::segments::store::get_orbiters;
use crate::types::interface::{
    CreateCanisterConfig, GetMonitoringHistory, MonitoringStartConfig, MonitoringStatus,
    MonitoringStopConfig,
};
use crate::types::state::{
    Config, HeapState, MissionControlSettings, MonitoringHistory, MonitoringHistoryKey, Orbiter,
    Orbiters, Satellite, Satellites, State, User,
};
use candid::Principal;
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::{arg_data, ArgDecoderConfig};
use ic_cdk::trap;
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::{Tokens, TransferArgs, TransferResult};
use icrc_ledger_types::icrc1::transfer::TransferArg;
use junobuild_shared::ledger::icp::transfer_token;
use junobuild_shared::ledger::icrc::icrc_transfer_token;
use junobuild_shared::ledger::types::icrc::IcrcTransferResult;
use junobuild_shared::mgmt::cmc::top_up_canister;
use junobuild_shared::mgmt::ic::deposit_cycles as deposit_cycles_shared;
use junobuild_shared::types::interface::{DepositCyclesArgs, MissionControlArgs, SetController};
use junobuild_shared::types::state::{
    ControllerId, ControllerScope, Controllers, OrbiterId, SatelliteId,
};
use junobuild_shared::types::state::{Metadata, UserId};
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};
use monitoring::monitor::{
    defer_restart_monitoring, get_monitoring_history as get_any_monitoring_history,
    get_monitoring_status as get_any_monitoring_status,
    start_monitoring as start_monitoring_with_current_config,
    stop_monitoring as stop_any_monitoring, update_and_start_monitoring_with_config,
    update_and_stop_monitoring_with_config,
};
use segments::store::{
    get_satellites, set_orbiter_metadata as set_orbiter_metadata_store,
    set_satellite_metadata as set_satellite_metadata_store,
};
use std::collections::HashMap;
use user::store::{
    get_config as get_config_store, get_metadata as get_metadata_store,
    get_settings as get_settings_store, get_user as get_user_store,
    get_user_data as get_user_data_store, set_config as set_config_store,
    set_metadata as set_metadata_store,
};

#[init]
fn init() {
    let call_arg = arg_data::<(Option<MissionControlArgs>,)>(ArgDecoderConfig::default()).0;
    let user = call_arg.unwrap().user;

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap: HeapState::from(&user),
            stable: init_stable_state(),
        };
    });

    init_runtime_state();

    defer_init_random_seed();
}

#[pre_upgrade]
fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the mission control in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_upgrades());
}

#[post_upgrade]
fn post_upgrade() {
    let memory = get_memory_upgrades();
    let state_bytes = read_post_upgrade(&memory);

    let state: State = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the mission control in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    init_runtime_state();

    defer_init_random_seed();

    defer_restart_monitoring();
}

// ---------------------------------------------------------
// Satellites
// ---------------------------------------------------------

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
async fn create_satellite_with_config(config: CreateCanisterConfig) -> Satellite {
    create_satellite_with_config_console(&config)
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

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_satellite(satellite_id: SatelliteId, name: Option<String>) -> Satellite {
    attach_satellite(&satellite_id, &name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn unset_satellite(satellite_id: SatelliteId) {
    detach_satellite(&satellite_id)
        .await
        .unwrap_or_else(|e| trap(&e))
}

// ---------------------------------------------------------
// Orbiters
// ---------------------------------------------------------

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
async fn create_orbiter_with_config(config: CreateCanisterConfig) -> Orbiter {
    create_orbiter_with_config_console(&config)
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
async fn unset_orbiter(orbiter_id: OrbiterId) {
    detach_orbiter(&orbiter_id)
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

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Mgmt
// ---------------------------------------------------------

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_user() -> UserId {
    get_user_store()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_user_data() -> User {
    get_user_data_store()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_metadata() -> Metadata {
    get_metadata_store()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_metadata(metadata: Metadata) {
    set_metadata_store(&metadata)
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_config() -> Option<Config> {
    get_config_store()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_config(config: Option<Config>) {
    set_config_store(&config)
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_settings() -> Option<MissionControlSettings> {
    get_settings_store()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn top_up(canister_id: Principal, amount: Tokens) {
    top_up_canister(&canister_id, &amount)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn deposit_cycles(args: DepositCyclesArgs) {
    deposit_cycles_shared(args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

// ---------------------------------------------------------
// Monitoring
// ---------------------------------------------------------

#[update(guard = "caller_is_user_or_admin_controller")]
fn start_monitoring() {
    start_monitoring_with_current_config().unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn stop_monitoring() {
    stop_any_monitoring().unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn update_and_start_monitoring(config: MonitoringStartConfig) {
    update_and_start_monitoring_with_config(&config).unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn update_and_stop_monitoring(config: MonitoringStopConfig) {
    update_and_stop_monitoring_with_config(&config).unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_monitoring_status() -> MonitoringStatus {
    get_any_monitoring_status()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_monitoring_history(
    filter: GetMonitoringHistory,
) -> Vec<(MonitoringHistoryKey, MonitoringHistory)> {
    get_any_monitoring_history(&filter)
}

// ---------------------------------------------------------
// Wallet
// ---------------------------------------------------------

#[update(guard = "caller_is_user_or_admin_controller")]
async fn icp_transfer(args: TransferArgs) -> TransferResult {
    transfer_token(args)
        .await
        .map_err(|e| trap(&format!("Failed to call ledger: {:?}", e)))?
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn icrc_transfer(ledger_id: Principal, args: TransferArg) -> IcrcTransferResult {
    icrc_transfer_token(ledger_id, args)
        .await
        .map_err(|e| trap(&format!("Failed to call ICRC ledger: {:?}", e)))?
}

// Generate did files

export_candid!();
