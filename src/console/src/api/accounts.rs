use crate::accounts::{
    get_optional_account as get_account_store, list_accounts as list_accounts_store,
};
use crate::guards::caller_is_admin_controller;
use crate::types::state::{Account, Accounts};
use ic_cdk_macros::query;
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;

#[query]
fn get_account() -> Option<Account> {
    let caller = caller();
    get_account_store(&caller).unwrap_or_trap()
}

#[query(guard = "caller_is_admin_controller")]
fn list_accounts() -> Accounts {
    list_accounts_store()
}
