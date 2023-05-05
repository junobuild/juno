mod constants;
mod controllers;
mod guards;
mod impls;
mod mission_control;
mod satellite;
mod store;
mod types;
mod upgrade;
mod wasm;

use crate::constants::SATELLITE_CREATION_FEE_ICP;
use crate::guards::{caller_is_admin_controller, caller_is_observatory};
use crate::mission_control::init_user_mission_control;
use crate::satellite::create_satellite as create_satellite_console;
use crate::store::{
    add_invitation_code as add_invitation_code_store, delete_controllers,
    get_credits as get_credits_store, get_existing_mission_control, get_mission_control,
    get_mission_control_release_version, get_satellite_release_version, has_credits,
    list_mission_controls, load_mission_control_release, load_satellite_release,
    reset_mission_control_release, reset_satellite_release,
    set_controllers as set_controllers_store, update_mission_controls_rate_config,
    update_satellites_rate_config,
};
use crate::types::interface::{LoadRelease, ReleasesVersion, Segment};
use crate::types::state::{
    InvitationCode, MissionControl, MissionControls, RateConfig, Rates, Releases, StableState,
    State,
};
use crate::upgrade::types::upgrade::UpgradeStableState;
use candid::Principal;
use ic_cdk::api::caller;
use ic_cdk::export::candid::{candid_method, export_service};
use ic_cdk::storage::stable_restore;
use ic_cdk::{id, storage, trap};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::Tokens;
use shared::controllers::init_controllers;
use shared::types::interface::{
    AssertMissionControlCenterArgs, CreateSatelliteArgs, DeleteControllersArgs,
    GetCreateSatelliteFeeArgs, SetControllersArgs,
};
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
                mission_controls: HashMap::new(),
                payments: HashMap::new(),
                releases: Releases::default(),
                invitation_codes: HashMap::new(),
                controllers: init_controllers(&[manager]),
                rates: Rates::default(),
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
    let (upgrade_stable,): (UpgradeStableState,) = stable_restore().unwrap();

    let stable = StableState::from(&upgrade_stable);

    STATE.with(|state| *state.borrow_mut() = State { stable });
}

/// Mission control center and satellite releases and wasm

#[candid_method(update)]
#[update(guard = "caller_is_admin_controller")]
fn reset_release(segment: Segment) {
    match segment {
        Segment::Satellite => reset_satellite_release(),
        Segment::MissionControl => reset_mission_control_release(),
    }
}

#[candid_method(update)]
#[update(guard = "caller_is_admin_controller")]
fn load_release(segment: Segment, blob: Vec<u8>, version: String) -> LoadRelease {
    let total: usize = match segment {
        Segment::Satellite => {
            load_satellite_release(&blob, &version);
            STATE.with(|state| state.borrow().stable.releases.satellite.wasm.len())
        }
        Segment::MissionControl => {
            load_mission_control_release(&blob, &version);
            STATE.with(|state| state.borrow().stable.releases.mission_control.wasm.len())
        }
    };

    LoadRelease {
        total,
        chunks: blob.len(),
    }
}

#[candid_method(query)]
#[query]
fn get_releases_version() -> ReleasesVersion {
    ReleasesVersion {
        satellite: get_satellite_release_version(),
        mission_control: get_mission_control_release_version(),
    }
}

/// User mission control centers

#[candid_method(query)]
#[query]
fn get_user_mission_control_center() -> Option<MissionControl> {
    let caller = caller();
    let result = get_mission_control(&caller);

    match result {
        Ok(mission_control) => mission_control,
        Err(error) => trap(error),
    }
}

#[candid_method(query)]
#[query(guard = "caller_is_observatory")]
fn assert_mission_control_center(
    AssertMissionControlCenterArgs {
        user,
        mission_control_id,
    }: AssertMissionControlCenterArgs,
) {
    get_existing_mission_control(&user, &mission_control_id).unwrap_or_else(|e| trap(e));
}

#[candid_method(query)]
#[query(guard = "caller_is_admin_controller")]
fn list_user_mission_control_centers() -> MissionControls {
    list_mission_controls()
}

#[candid_method(update)]
#[update]
async fn init_user_mission_control_center() -> MissionControl {
    let caller = caller();
    let console = id();

    init_user_mission_control(&console, &caller)
        .await
        .unwrap_or_else(|e| trap(&e))
}

/// Satellites

#[candid_method(update)]
#[update]
async fn create_satellite(args: CreateSatelliteArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_satellite_console(console, caller, args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

/// Economy

#[candid_method(query)]
#[query]
async fn get_credits() -> Tokens {
    let caller = caller();

    get_credits_store(&caller).unwrap_or_else(|e| trap(e))
}

#[candid_method(query)]
#[query]
async fn get_create_satellite_fee(
    GetCreateSatelliteFeeArgs { user }: GetCreateSatelliteFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    match has_credits(&user, &caller) {
        false => Some(SATELLITE_CREATION_FEE_ICP),
        true => None,
    }
}

/// Closed beta - invitation codes

#[candid_method(update)]
#[update(guard = "caller_is_admin_controller")]
fn add_invitation_code(code: InvitationCode) {
    add_invitation_code_store(&code);
}

/// Rates

#[candid_method(update)]
#[update(guard = "caller_is_admin_controller")]
fn update_rate_config(segment: Segment, config: RateConfig) {
    match segment {
        Segment::Satellite => update_satellites_rate_config(&config),
        Segment::MissionControl => update_mission_controls_rate_config(&config),
    }
}

/// Mgmt

#[candid_method(query)]
#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Controllers

#[candid_method(update)]
#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_controllers_store(&controllers, &controller);
}

#[candid_method(update)]
#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_controllers(&controllers);
}

// Generate did files

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
            .join("console");
        write(dir.join("console.did"), export_candid()).expect("Write failed.");
    }
}
