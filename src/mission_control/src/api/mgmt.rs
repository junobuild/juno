use crate::guards::caller_is_user_or_admin_controller;
use crate::types::state::{Config, MissionControlSettings, User};
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
    crate::user::store::get_user()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_user_data() -> User {
    crate::user::store::get_user_data()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_metadata() -> Metadata {
    crate::user::store::get_metadata()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_metadata(metadata: Metadata) {
    crate::user::store::set_metadata(&metadata)
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_config() -> Option<Config> {
    crate::user::store::get_config()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_config(config: Option<Config>) {
    crate::user::store::set_config(&config)
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_settings() -> Option<MissionControlSettings> {
    crate::user::store::get_settings()
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
