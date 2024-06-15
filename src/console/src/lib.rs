mod constants;
mod controllers;
mod factory;
mod guards;
mod impls;
mod memory;
mod storage;
mod store;
mod types;
mod upgrade;
mod wasm;

use crate::factory::mission_control::init_user_mission_control;
use crate::factory::orbiter::create_orbiter as create_orbiter_console;
use crate::factory::satellite::create_satellite as create_satellite_console;
use crate::guards::{caller_is_admin_controller, caller_is_observatory};
use crate::storage::batch_group::{commit_batch_group, propose_batch_group};
use crate::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::storage::store::{
    delete_domain_store, get_config_store, get_custom_domains_store, set_config_store,
    set_domain_store,
};
use crate::storage::strategy_impls::{StorageAssertions, StorageState, StorageUpload};
use crate::storage::types::state::BatchGroupProposal;
use crate::store::heap::{
    add_invitation_code as add_invitation_code_store, delete_controllers, get_controllers,
    get_mission_control_release_version, get_orbiter_fee, get_orbiter_release_version,
    get_satellite_fee, get_satellite_release_version, list_mission_controls_heap,
    list_payments_heap, load_mission_control_release, load_orbiter_release, load_satellite_release,
    reset_mission_control_release, reset_orbiter_release, reset_satellite_release,
    set_controllers as set_controllers_store, set_create_orbiter_fee, set_create_satellite_fee,
    update_mission_controls_rate_config, update_orbiters_rate_config,
    update_satellites_rate_config,
};
use crate::store::stable::{
    add_credits as add_credits_store, get_credits as get_credits_store,
    get_existing_mission_control, get_mission_control, has_credits,
};
use crate::types::interface::{Config, LoadRelease, ReleasesVersion, Segment};
use crate::types::state::{
    Fees, HeapState, InvitationCode, MissionControl, MissionControls, RateConfig, Rates, Releases,
    State,
};
use candid::Principal;
use ciborium::into_writer;
use ic_cdk::api::caller;
use ic_cdk::storage::stable_restore;
use ic_cdk::{id, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::Tokens;
use junobuild_shared::controllers::init_controllers;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::interface::{
    AssertMissionControlCenterArgs, CreateCanisterArgs, DeleteControllersArgs,
    GetCreateCanisterFeeArgs, SetControllersArgs,
};
use junobuild_shared::types::state::{Controllers, UserId};
use junobuild_shared::upgrade::write_pre_upgrade;
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::http_request::{
    http_request as http_request_storage,
    http_request_streaming_callback as http_request_streaming_callback_storage,
};
use junobuild_storage::store::{
    commit_batch as commit_batch_storage, create_batch, create_batch_group, create_chunk,
};
use junobuild_storage::types::domain::CustomDomains;
use junobuild_storage::types::interface::{
    CommitBatch, CommitBatchGroup, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::state::StorageHeapState;
use memory::{get_memory_upgrades, init_stable_state};
use std::cell::RefCell;
use std::collections::HashMap;
use types::state::Payments;
use upgrade::{defer_migrate_mission_controls, defer_migrate_payments};

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

#[init]
fn init() {
    let manager = caller();

    let heap: HeapState = HeapState {
        mission_controls: HashMap::new(),
        payments: HashMap::new(),
        releases: Releases::default(),
        invitation_codes: HashMap::new(),
        controllers: init_controllers(&[manager]),
        rates: Rates::default(),
        fees: Fees::default(),
        storage: Some(StorageHeapState::default()),
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap,
            stable: init_stable_state(),
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the console in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_upgrades());
}

#[post_upgrade]
fn post_upgrade() {
    // TODO: remove once stable memory introduced on mainnet
    let (heap,): (HeapState,) = stable_restore().unwrap();

    STATE.with(|state| {
        *state.borrow_mut() = State {
            heap,
            stable: init_stable_state(),
        }
    });

    defer_migrate_mission_controls();
    defer_migrate_payments();

    // TODO: uncomment once stable memory introduced on mainnet
    // let memory: Memory = get_memory_upgrades();
    // let state_bytes = read_post_upgrade(&memory);

    // let state: State = from_reader(&*state_bytes)
    //     .expect("Failed to decode the state of the orbiter in post_upgrade hook.");

    // STATE.with(|s| *s.borrow_mut() = state);

    defer_init_certified_assets();
}

/// Mission control center and satellite releases and wasm

#[update(guard = "caller_is_admin_controller")]
fn reset_release(segment: Segment) {
    match segment {
        Segment::Satellite => reset_satellite_release(),
        Segment::MissionControl => reset_mission_control_release(),
        Segment::Orbiter => reset_orbiter_release(),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn load_release(segment: Segment, blob: Vec<u8>, version: String) -> LoadRelease {
    let total: usize = match segment {
        Segment::Satellite => {
            load_satellite_release(&blob, &version);
            STATE.with(|state| state.borrow().heap.releases.satellite.wasm.len())
        }
        Segment::MissionControl => {
            load_mission_control_release(&blob, &version);
            STATE.with(|state| state.borrow().heap.releases.mission_control.wasm.len())
        }
        Segment::Orbiter => {
            load_orbiter_release(&blob, &version);
            STATE.with(|state| state.borrow().heap.releases.orbiter.wasm.len())
        }
    };

    LoadRelease {
        total,
        chunks: blob.len(),
    }
}

#[query]
fn get_releases_version() -> ReleasesVersion {
    ReleasesVersion {
        satellite: get_satellite_release_version(),
        mission_control: get_mission_control_release_version(),
        orbiter: get_orbiter_release_version(),
    }
}

/// User mission control centers

#[query]
fn get_user_mission_control_center() -> Option<MissionControl> {
    let caller = caller();
    let result = get_mission_control(&caller);

    match result {
        Ok(mission_control) => mission_control,
        Err(error) => trap(error),
    }
}

#[query(guard = "caller_is_observatory")]
fn assert_mission_control_center(
    AssertMissionControlCenterArgs {
        user,
        mission_control_id,
    }: AssertMissionControlCenterArgs,
) {
    get_existing_mission_control(&user, &mission_control_id).unwrap_or_else(|e| trap(e));
}

#[query(guard = "caller_is_admin_controller")]
fn list_user_mission_control_centers() -> MissionControls {
    list_mission_controls_heap()
}

#[update]
async fn init_user_mission_control_center() -> MissionControl {
    let caller = caller();
    let console = id();

    init_user_mission_control(&console, &caller)
        .await
        .unwrap_or_else(|e| trap(&e))
}

/// Transactions

#[query(guard = "caller_is_admin_controller")]
fn list_payments() -> Payments {
    list_payments_heap()
}

/// Satellites

#[update]
async fn create_satellite(args: CreateCanisterArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_satellite_console(console, caller, args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

/// Orbiters

#[update]
async fn create_orbiter(args: CreateCanisterArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_orbiter_console(console, caller, args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

/// Economy

#[query]
fn get_credits() -> Tokens {
    let caller = caller();

    get_credits_store(&caller).unwrap_or_else(|e| trap(e))
}

#[update(guard = "caller_is_admin_controller")]
fn add_credits(user: UserId, credits: Tokens) {
    add_credits_store(&user, &credits).unwrap_or_else(|e| trap(e));
}

#[query]
fn get_create_satellite_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_satellite_fee();

    match has_credits(&user, &caller, &fee) {
        false => Some(fee),
        true => None,
    }
}

#[query]
fn get_create_orbiter_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_orbiter_fee();

    match has_credits(&user, &caller, &fee) {
        false => Some(fee),
        true => None,
    }
}

#[update(guard = "caller_is_admin_controller")]
fn set_fee(segment: Segment, fee: Tokens) {
    match segment {
        Segment::Satellite => set_create_satellite_fee(&fee),
        Segment::MissionControl => trap("Fee for mission control not supported."),
        Segment::Orbiter => set_create_orbiter_fee(&fee),
    }
}

/// Closed beta - invitation codes

#[update(guard = "caller_is_admin_controller")]
fn add_invitation_code(code: InvitationCode) {
    add_invitation_code_store(&code);
}

/// Rates

#[update(guard = "caller_is_admin_controller")]
fn update_rate_config(segment: Segment, config: RateConfig) {
    match segment {
        Segment::Satellite => update_satellites_rate_config(&config),
        Segment::MissionControl => update_mission_controls_rate_config(&config),
        Segment::Orbiter => update_orbiters_rate_config(&config),
    }
}

/// Mgmt

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
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

/// Storage

#[update(guard = "caller_is_admin_controller")]
fn init_assets_upload_group() -> BatchGroupId {
    let caller = caller();

    create_batch_group(caller)
}

#[update(guard = "caller_is_admin_controller")]
fn init_asset_upload(init: InitAssetKey, batch_group_id: BatchGroupId) -> InitUploadResult {
    let caller = caller();

    let controllers = get_controllers();

    let result = create_batch(caller, &controllers, init, Some(batch_group_id));

    match result {
        Ok(batch_id) => InitUploadResult { batch_id },
        Err(error) => trap(&error),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();

    let result = create_chunk(caller, chunk);

    match result {
        Ok(chunk_id) => UploadChunkResult { chunk_id },
        Err(error) => trap(error),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn commit_asset_upload(commit: CommitBatch) {
    let caller = caller();

    let controllers: Controllers = get_controllers();

    commit_batch_storage(
        caller,
        &controllers,
        commit,
        &StorageAssertions,
        &StorageState,
        &StorageUpload,
    )
    .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_admin_controller")]
fn propose_assets_upload_group(batch_group_id: BatchGroupId) -> (BatchGroupId, BatchGroupProposal) {
    let caller = caller();

    propose_batch_group(caller, &batch_group_id).unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_admin_controller")]
fn commit_assets_upload_group(batch_group: CommitBatchGroup) {
    commit_batch_group(&batch_group).unwrap_or_else(|e| trap(&e));

    defer_init_certified_assets();
}

///
/// Config
///

#[update(guard = "caller_is_admin_controller")]
pub fn set_config(config: Config) {
    set_config_store(&config.storage);
}

#[update(guard = "caller_is_admin_controller")]
pub fn get_config() -> Config {
    let storage = get_config_store();
    Config { storage }
}

///
/// Custom domains
///

#[query(guard = "caller_is_admin_controller")]
pub fn list_custom_domains() -> CustomDomains {
    get_custom_domains_store()
}

#[update(guard = "caller_is_admin_controller")]
pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    set_domain_store(&domain_name, &bn_id).unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_admin_controller")]
pub fn del_custom_domain(domain_name: DomainName) {
    delete_domain_store(&domain_name).unwrap_or_else(|e| trap(&e));
}

///
/// Http
///

#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    http_request_storage(request, &StorageState)
}

#[query]
pub fn http_request_streaming_callback(
    streaming_callback_token: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    http_request_streaming_callback_storage(streaming_callback_token, &StorageState)
}

// Generate did files

export_candid!();
