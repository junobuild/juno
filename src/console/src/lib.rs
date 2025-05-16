#![deny(clippy::disallowed_methods)]

mod constants;
mod controllers;
mod factory;
mod guards;
mod impls;
mod memory;
mod metadata;
mod msg;
mod proposals;
mod storage;
mod store;
mod strategies_impls;
mod types;
mod wasm;

use crate::factory::mission_control::init_user_mission_control;
use crate::factory::orbiter::create_orbiter as create_orbiter_console;
use crate::factory::satellite::create_satellite as create_satellite_console;
use crate::guards::{caller_is_admin_controller, caller_is_observatory};
use crate::memory::{init_storage_heap_state, STATE};
use crate::proposals::{
    commit_proposal as make_commit_proposal,
    delete_proposal_assets as delete_proposal_assets_proposal, init_proposal as make_init_proposal,
    submit_proposal as make_submit_proposal,
};
use crate::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::storage::store::{
    delete_domain_store, get_config_store as get_storage_config_store, get_custom_domains_store,
    init_asset_upload as init_asset_upload_store, list_assets as list_assets_store,
    set_config_store as set_storage_config_store, set_domain_store,
};
use crate::store::heap::{
    add_invitation_code as add_invitation_code_store, delete_controllers, get_controllers,
    get_orbiter_fee, get_satellite_fee, set_controllers as set_controllers_store,
    set_create_orbiter_fee, set_create_satellite_fee, update_mission_controls_rate_config,
    update_orbiters_rate_config, update_satellites_rate_config,
};
use crate::store::stable::{
    add_credits as add_credits_store, get_credits as get_credits_store,
    get_existing_mission_control, get_mission_control, get_proposal as get_proposal_state,
    has_credits, list_mission_controls, list_payments as list_payments_state,
};
use crate::types::interface::{CommitProposal, Config, DeleteProposalAssets};
use crate::types::state::{
    Fees, HeapState, InvitationCode, MissionControl, MissionControls, Proposal, ProposalId,
    ProposalType, Rates, ReleasesMetadata, State,
};
use candid::Principal;
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::ManualReply;
use ic_cdk::api::caller;
use ic_cdk::{id, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_ledger_types::Tokens;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::init_controllers;
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::interface::{
    AssertMissionControlCenterArgs, CreateCanisterArgs, DeleteControllersArgs,
    GetCreateCanisterFeeArgs, SetControllersArgs,
};
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::{Controllers, SegmentKind, UserId};
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::http_request::{
    http_request as http_request_storage,
    http_request_streaming_callback as http_request_streaming_callback_storage,
};
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_chunk};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use memory::{get_memory_upgrades, init_stable_state};
use std::collections::HashMap;
use strategies_impls::storage::{StorageAssertions, StorageState, StorageUpload};
use types::state::Payments;

#[init]
fn init() {
    let manager = caller();

    let heap: HeapState = HeapState {
        mission_controls: HashMap::new(),
        payments: HashMap::new(),
        invitation_codes: HashMap::new(),
        controllers: init_controllers(&[manager]),
        rates: Rates::default(),
        fees: Fees::default(),
        storage: init_storage_heap_state(),
        releases_metadata: ReleasesMetadata::default(),
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
    let memory = get_memory_upgrades();
    let state_bytes = read_post_upgrade(&memory);

    let state: State = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the console in post_upgrade hook.");

    STATE.with(|s| *s.borrow_mut() = state);

    defer_init_certified_assets();
}

// ---------------------------------------------------------
// User mission control centers
// ---------------------------------------------------------

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
    list_mission_controls()
}

#[update]
async fn init_user_mission_control_center() -> MissionControl {
    let caller = caller();
    let console = id();

    init_user_mission_control(&console, &caller)
        .await
        .unwrap_or_else(|e| trap(&e))
}

// ---------------------------------------------------------
// Transactions
// ---------------------------------------------------------

#[query(guard = "caller_is_admin_controller")]
fn list_payments() -> Payments {
    list_payments_state()
}

// ---------------------------------------------------------
// Satellites
// ---------------------------------------------------------

#[update]
async fn create_satellite(args: CreateCanisterArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_satellite_console(console, caller, args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

// ---------------------------------------------------------
// Orbiters
// ---------------------------------------------------------

#[update]
async fn create_orbiter(args: CreateCanisterArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_orbiter_console(console, caller, args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

// ---------------------------------------------------------
// Economy
// ---------------------------------------------------------

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
fn set_fee(segment: SegmentKind, fee: Tokens) {
    match segment {
        SegmentKind::Satellite => set_create_satellite_fee(&fee),
        SegmentKind::MissionControl => trap("Fee for mission control not supported."),
        SegmentKind::Orbiter => set_create_orbiter_fee(&fee),
    }
}

// ---------------------------------------------------------
// Closed beta - invitation codes
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn add_invitation_code(code: InvitationCode) {
    add_invitation_code_store(&code);
}

// ---------------------------------------------------------
// Rates
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn update_rate_config(segment: SegmentKind, config: RateConfig) {
    match segment {
        SegmentKind::Satellite => update_satellites_rate_config(&config),
        SegmentKind::MissionControl => update_mission_controls_rate_config(&config),
        SegmentKind::Orbiter => update_orbiters_rate_config(&config),
    }
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
// Proposal
// ---------------------------------------------------------

#[query]
fn get_proposal(proposal_id: ProposalId) -> Option<Proposal> {
    get_proposal_state(&proposal_id)
}

#[update(guard = "caller_is_admin_controller")]
fn init_proposal(proposal_type: ProposalType) -> (ProposalId, Proposal) {
    let caller = caller();

    make_init_proposal(caller, &proposal_type).unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_admin_controller")]
fn submit_proposal(proposal_id: ProposalId) -> (ProposalId, Proposal) {
    let caller = caller();

    make_submit_proposal(caller, &proposal_id).unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_admin_controller", manual_reply = true)]
fn commit_proposal(proposal: CommitProposal) -> ManualReply<()> {
    match make_commit_proposal(&proposal) {
        Ok(_) => {
            defer_init_certified_assets();
            ManualReply::one(())
        }
        Err(e) => ManualReply::reject(e.to_string()),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn delete_proposal_assets(DeleteProposalAssets { proposal_ids }: DeleteProposalAssets) {
    let caller = caller();

    delete_proposal_assets_proposal(caller, &proposal_ids).unwrap_or_else(|e| trap(&e));
}

// ---------------------------------------------------------
// Storage
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn init_asset_upload(init: InitAssetKey, proposal_id: ProposalId) -> InitUploadResult {
    let caller = caller();

    let result = init_asset_upload_store(caller, init, proposal_id);

    match result {
        Ok(batch_id) => InitUploadResult { batch_id },
        Err(error) => trap(&error),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();
    let config = get_storage_config_store();

    let result = create_chunk(caller, &config, chunk);

    match result {
        Ok(chunk_id) => UploadChunkResult { chunk_id },
        Err(error) => trap(&error),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn commit_asset_upload(commit: CommitBatch) {
    let caller = caller();

    let controllers: Controllers = get_controllers();
    let config = get_storage_config_store();

    commit_batch_storage(
        caller,
        &controllers,
        &config,
        commit,
        &StorageAssertions,
        &StorageState,
        &StorageUpload,
    )
    .unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_admin_controller")]
pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    let result = list_assets_store(&collection, &filter);

    match result {
        Ok(result) => result,
        Err(error) => trap(&["Assets cannot be listed: ".to_string(), error].join("")),
    }
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
pub fn get_config() -> Config {
    let storage = get_storage_config_store();
    Config { storage }
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
pub fn set_storage_config(config: StorageConfig) {
    set_storage_config_store(&config);
}

#[query(guard = "caller_is_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    get_storage_config_store()
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Http
// ---------------------------------------------------------

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
