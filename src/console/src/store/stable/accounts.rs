use crate::constants::E8S_PER_ICP;
use crate::store::{with_accounts, with_accounts_mut};
use crate::types::state::{Account, Accounts, AccountsStable, Provider};
use ic_cdk::api::time;
use junobuild_shared::structures::collect_stable_map_from;
use junobuild_shared::types::state::{MissionControlId, UserId};
use junobuild_shared::utils::principal_equal;

pub fn get_account(user: &UserId) -> Result<Option<Account>, &'static str> {
    with_accounts(|accounts| get_account_impl(user, accounts))
}

fn get_account_impl(
    user: &UserId,
    accounts: &AccountsStable,
) -> Result<Option<Account>, &'static str> {
    let Some(account) = accounts.get(user) else {
        return Ok(None);
    };

    if principal_equal(*user, account.owner) {
        return Ok(Some(account.clone()));
    }

    Err("User does not have the permission for the mission control.")
}

pub fn get_account_with_existing_mission_control(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<Account, &'static str> {
    with_accounts(|accounts| {
        get_account_with_existing_mission_control_impl(user, mission_control_id, accounts)
    })
}

fn get_account_with_existing_mission_control_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    accounts: &AccountsStable,
) -> Result<Account, &'static str> {
    let existing_account = accounts.get(user).ok_or("User does not have an account.")?;

    let existing_mission_control_id = existing_account
        .mission_control_id
        .ok_or("User mission control center does not exist yet.")?;

    if principal_equal(existing_mission_control_id, *mission_control_id) {
        return Ok(existing_account.clone());
    }

    Err("User does not have the permission to access the mission control center.")
}

pub fn init_account_with_empty_mission_control(user: &UserId, provider: &Option<Provider>) {
    with_accounts_mut(|accounts| {
        init_account_with_empty_mission_control_impl(user, provider, accounts)
    })
}

fn init_account_with_empty_mission_control_impl(
    user: &UserId,
    provider: &Option<Provider>,
    accounts: &mut AccountsStable,
) {
    let now = time();

    let account = Account {
        mission_control_id: None,
        provider: provider.clone(),
        owner: *user,
        credits: E8S_PER_ICP,
        created_at: now,
        updated_at: now,
    };

    accounts.insert(*user, account);
}

pub fn update_account(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<Account, &'static str> {
    with_accounts_mut(|accounts| update_account_impl(user, mission_control_id, accounts))
}

fn update_account_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    accounts: &mut AccountsStable,
) -> Result<Account, &'static str> {
    let now = time();

    let account = accounts.get(user).ok_or("User does not have an account.")?;

    let finalized_account = Account {
        mission_control_id: Some(*mission_control_id),
        updated_at: now,
        ..account
    };

    accounts.insert(*user, finalized_account.clone());

    Ok(finalized_account)
}

pub fn update_provider(user: &UserId, provider: &Provider) -> Result<Account, String> {
    with_accounts_mut(|accounts| update_provider_impl(user, provider, accounts))
}

fn update_provider_impl(
    user: &UserId,
    provider: &Provider,
    accounts: &mut AccountsStable,
) -> Result<Account, String> {
    let account = accounts.get(user).ok_or("User does not have an account.")?;

    let update_account = Account {
        updated_at: time(),
        provider: Some(provider.clone()),
        ..account
    };

    accounts.insert(*user, update_account.clone());

    Ok(update_account)
}

pub fn delete_account(user: &UserId) -> Option<Account> {
    with_accounts_mut(|accounts| delete_account_impl(user, accounts))
}

fn delete_account_impl(user: &UserId, accounts: &mut AccountsStable) -> Option<Account> {
    accounts.remove(user)
}

pub fn list_accounts() -> Accounts {
    with_accounts(|accounts| list_accounts_impl(accounts))
}

fn list_accounts_impl(accounts: &AccountsStable) -> Accounts {
    collect_stable_map_from(accounts)
}
