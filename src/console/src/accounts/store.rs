use crate::store::{with_accounts, with_accounts_mut};
use crate::types::state::{Account, Accounts, AccountsStable, Orbiter, Provider, Satellite};
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

    Err("User does not have the permission for the account.")
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

pub fn init_account(user: &UserId, provider: &Option<Provider>) -> Account {
    with_accounts_mut(|accounts| init_account_impl(user, provider, accounts))
}

fn init_account_impl(
    user: &UserId,
    provider: &Option<Provider>,
    accounts: &mut AccountsStable,
) -> Account {
    let account = Account::init(user, provider);
    accounts.insert(*user, account.clone());

    account
}

pub fn update_mission_control(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<Account, String> {
    update_account(user, |account| {
        account.set_mission_control_id(mission_control_id)
    })
}

pub fn update_provider(user: &UserId, provider: &Provider) -> Result<Account, String> {
    update_account(user, |account| account.set_provider(provider))
}

fn update_account<F>(user: &UserId, update_fn: F) -> Result<Account, String>
where
    F: FnOnce(&Account) -> Account,
{
    with_accounts_mut(|accounts| update_account_impl(user, update_fn, accounts))
}

fn update_account_impl<F>(
    user: &UserId,
    update_fn: F,
    accounts: &mut AccountsStable,
) -> Result<Account, String>
where
    F: FnOnce(&Account) -> Account,
{
    let account = accounts.get(user).ok_or("User does not have an account.")?;

    let update_account = update_fn(&account);

    accounts.insert(*user, update_account.clone());

    Ok(update_account)
}

pub fn add_satellite(user: &UserId, satellite: &Satellite) -> Result<(), String> {
    add_segment(user, satellite, |account, segment| {
        account.add_satellite(segment)
    })
}

pub fn add_orbiter(user: &UserId, orbiter: &Orbiter) -> Result<(), String> {
    add_segment(user, orbiter, |account, segment| {
        account.add_orbiter(segment)
    })
}

fn add_segment<T>(
    user: &UserId,
    segment: &T,
    add_fn: impl FnOnce(&mut Account, &T),
) -> Result<(), String> {
    with_accounts_mut(|accounts| add_segment_impl(user, segment, add_fn, accounts))
}

fn add_segment_impl<T>(
    user: &UserId,
    segment: &T,
    add_fn: impl FnOnce(&mut Account, &T),
    accounts: &mut AccountsStable,
) -> Result<(), String> {
    let mut account = accounts.get(user).ok_or("User does not have an account.")?;

    add_fn(&mut account, segment);

    accounts.insert(*user, account);

    Ok(())
}

pub fn delete_account(user: &UserId) -> Option<Account> {
    with_accounts_mut(|accounts| delete_account_impl(user, accounts))
}

fn delete_account_impl(user: &UserId, accounts: &mut AccountsStable) -> Option<Account> {
    accounts.remove(user)
}

pub fn list_accounts() -> Accounts {
    with_accounts(list_accounts_impl)
}

fn list_accounts_impl(accounts: &AccountsStable) -> Accounts {
    collect_stable_map_from(accounts)
}
