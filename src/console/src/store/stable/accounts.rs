use crate::constants::E8S_PER_ICP;
use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::types::state::{Account, Accounts, AccountsStable, Provider, StableState};
use ic_cdk::api::time;
use junobuild_shared::structures::collect_stable_map_from;
use junobuild_shared::types::state::{MissionControlId, UserId};
use junobuild_shared::utils::principal_equal;

pub fn get_account(user: &UserId) -> Result<Option<Account>, &'static str> {
    read_stable_state(|stable| get_account_impl(user, stable))
}

fn get_account_impl(user: &UserId, state: &StableState) -> Result<Option<Account>, &'static str> {
    let mission_control = state.accounts.get(user);

    match mission_control {
        None => Ok(None),
        Some(mission_control) => {
            if principal_equal(*user, mission_control.owner) {
                return Ok(Some(mission_control.clone()));
            }

            Err("User does not have the permission for the mission control.")
        }
    }
}

pub fn get_existing_account(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<Account, &'static str> {
    read_stable_state(|stable| get_existing_account_impl(user, mission_control_id, stable))
}

fn get_existing_account_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    state: &StableState,
) -> Result<Account, &'static str> {
    let existing_mission_control = state.accounts.get(user);

    match existing_mission_control {
        None => Err("User does not have a mission control center."),
        Some(existing_mission_control) => match existing_mission_control.mission_control_id {
            None => Err("User mission control center does not exist yet."),
            Some(existing_mission_control_id) => {
                if principal_equal(existing_mission_control_id, *mission_control_id) {
                    return Ok(existing_mission_control.clone());
                }

                Err("User does not have the permission to access the mission control center.")
            }
        },
    }
}

pub fn init_account_with_empty_mission_control(
    user: &UserId,
    provider: &Option<Provider>,
) -> Account {
    mutate_stable_state(|stable| {
        init_account_with_empty_mission_control_impl(user, provider, stable)
    })
}

fn init_account_with_empty_mission_control_impl(
    user: &UserId,
    provider: &Option<Provider>,
    state: &mut StableState,
) -> Account {
    let now = time();

    let mission_control = Account {
        mission_control_id: None,
        provider: provider.clone(),
        owner: *user,
        credits: E8S_PER_ICP,
        created_at: now,
        updated_at: now,
    };

    state.accounts.insert(*user, mission_control.clone());

    mission_control
}

pub fn add_account(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<Account, &'static str> {
    mutate_stable_state(|stable| add_account_impl(user, mission_control_id, stable))
}

fn add_account_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    state: &mut StableState,
) -> Result<Account, &'static str> {
    let now = time();

    let mission_control = state
        .accounts
        .get(user)
        .ok_or("User does not have a mission control.")?;

    let finalized_mission_control = Account {
        mission_control_id: Some(*mission_control_id),
        updated_at: now,
        ..mission_control
    };

    state
        .accounts
        .insert(*user, finalized_mission_control.clone());

    Ok(finalized_mission_control)
}

pub fn update_provider(user: &UserId, provider: &Provider) -> Result<Account, String> {
    mutate_stable_state(|stable| update_provider_impl(user, provider, stable))
}

fn update_provider_impl(
    user: &UserId,
    provider: &Provider,
    state: &mut StableState,
) -> Result<Account, String> {
    let mission_control = state
        .accounts
        .get(user)
        .ok_or("User does not have a mission control.")?;

    let update_mission_control = Account {
        updated_at: time(),
        provider: Some(provider.clone()),
        ..mission_control
    };

    state.accounts.insert(*user, update_mission_control.clone());

    Ok(update_mission_control)
}

pub fn delete_account(user: &UserId) -> Option<Account> {
    mutate_stable_state(|stable| delete_account_impl(user, stable))
}

fn delete_account_impl(user: &UserId, state: &mut StableState) -> Option<Account> {
    state.accounts.remove(user)
}

pub fn list_accounts() -> Accounts {
    read_stable_state(|stable| list_accounts_impl(&stable.accounts))
}

fn list_accounts_impl(mission_controls: &AccountsStable) -> Accounts {
    collect_stable_map_from(mission_controls)
}
