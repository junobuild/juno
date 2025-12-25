use crate::accounts::init::get_or_init_account as get_or_init_account_with_caller;
use crate::accounts::{get_optional_account, list_accounts as list_accounts_store};
use crate::guards::caller_is_admin_controller;
use crate::types::state::{Account, Accounts};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;

#[update]
fn get_or_init_account() -> Account {
    let caller = caller();
    get_or_init_account_with_caller(&caller).unwrap_or_trap()
}

#[query]
fn get_account() -> Option<Account> {
    let caller = caller();
    get_optional_account(&caller).unwrap_or_trap()
}

#[query(guard = "caller_is_admin_controller")]
fn list_accounts() -> Accounts {
    list_accounts_store()
}
