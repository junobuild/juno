use crate::guards::caller_is_user_or_admin_controller;
use crate::types::state::{MissionControlSettings, User};
use crate::user::store::{
    get_metadata as get_metadata_store, get_settings as get_settings_store,
    get_user as get_user_store, get_user_data as get_user_data_store,
    set_metadata as set_metadata_store,
};
use candid::Principal;
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use ic_ledger_types::Tokens;
use junobuild_shared::mgmt::cmc::top_up_canister;
use junobuild_shared::mgmt::ic::deposit_cycles as deposit_cycles_shared;
use junobuild_shared::types::interface::DepositCyclesArgs;
use junobuild_shared::types::state::{Metadata, UserId};

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
