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
use crate::guards::{caller_can_read, caller_is_user_or_controller};
use crate::mgmt::canister::top_up_canister;
use crate::mgmt::status::{collect_statuses, mission_control_status};
use crate::satellites::satellite::create_satellite as create_satellite_console;
use crate::store::{get_user as get_user_store, set_metadata as set_metadata_store};
use crate::types::state::{Satellite, SatelliteId, Satellites, StableState, State, User};
use crate::upgrade::types::upgrade::UpgradeStableState;
use candid::{candid_method, export_service, Principal};
use ic_cdk::api::call::arg_data;
use ic_cdk::{id, storage, trap};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::Tokens;
use satellites::store::get_satellites;
use shared::types::interface::{
    MissionControlArgs, SegmentStatus, SegmentsStatus, SetController, StatusesArgs,
};
use shared::types::state::{ControllerId, Controllers};
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

#[candid_method(query)]
#[query(guard = "caller_is_user_or_controller")]
fn list_satellites() -> Satellites {
    get_satellites()
}

#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn create_satellite(name: String) -> Satellite {
    create_satellite_console(&name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[deprecated(
    since = "0.0.3",
    note = "please use `set_satellites_controllers` instead"
)]
#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
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
#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
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

#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
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

#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn del_satellites_controllers(satellite_ids: Vec<SatelliteId>, controllers: Vec<UserId>) {
    for satellite_id in satellite_ids {
        delete_satellite_controllers(&satellite_id, &controllers)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

/// Mgmt
///
#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn top_up(canister_id: Principal, amount: Tokens) {
    top_up_canister(&canister_id, &amount)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[candid_method(query)]
#[query(guard = "caller_is_user_or_controller")]
fn get_user() -> UserId {
    get_user_store()
}

#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
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
#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn add_mission_control_controllers(controllers: Vec<UserId>) {
    let controller: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
    };

    set_controllers_to_mission_control(&controllers, &controller)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[deprecated(
    since = "0.0.3",
    note = "please use `del_mission_control_controllers` instead"
)]
#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn remove_mission_control_controllers(controllers: Vec<ControllerId>) {
    delete_controllers_to_mission_control(&controllers)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn set_mission_control_controllers(
    controllers: Vec<ControllerId>,
    controller: SetController,
) {
    set_controllers_to_mission_control(&controllers, &controller)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[candid_method(update)]
#[update(guard = "caller_is_user_or_controller")]
async fn del_mission_control_controllers(controllers: Vec<ControllerId>) {
    delete_controllers_to_mission_control(&controllers)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[candid_method(query)]
#[query(guard = "caller_is_user_or_controller")]
fn list_mission_control_controllers() -> Controllers {
    get_controllers()
}

///
/// Mgmt
///

#[candid_method(query)]
#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[candid_method(update)]
#[update(guard = "caller_can_read")]
async fn status() -> SegmentStatus {
    mission_control_status(&id(), &version())
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[candid_method(update)]
#[update(guard = "caller_can_read")]
async fn statuses(StatusesArgs { cycles_threshold }: StatusesArgs) -> SegmentsStatus {
    collect_statuses(&id(), &version(), cycles_threshold).await
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
            .join("mission_control");
        write(dir.join("mission_control.did"), export_candid()).expect("Write failed.");
    }
}
