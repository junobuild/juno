use crate::constants::E8S_PER_ICP;
use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::store::stable::get_existing_account;
use crate::types::state::{Account, StableState};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;
use junobuild_shared::types::state::{MissionControlId, UserId};

pub fn get_credits(user: &UserId) -> Result<Tokens, &'static str> {
    read_stable_state(|stable| get_credits_impl(user, stable))
}

fn get_credits_impl(user: &UserId, state: &StableState) -> Result<Tokens, &'static str> {
    let existing_account = state.accounts.get(user);

    match existing_account {
        None => Err("User does not have an account"),
        Some(account) => Ok(account.credits),
    }
}

// ---------------------------------------------------------
// Originally credits were equals to the fees. 0.5 ICP for a satellite covered by 0.5 credits.
// However, given that fees can now be dynamically set, the credits had to be indexed.
// That is why now one credit covers the creation fee regardless the ICP price.
//
// For example:
// - satellite fee is 2 ICP, 1 credit covers it
// - satellite fee is 9 ICP, 1 credit covers it
// - satellite fee is 2 ICP, 0.1 credits does no cover it
//
// More like a percent. 1 credit equals 1 creation.
// ---------------------------------------------------------

pub fn has_mission_control_and_credits(
    user: &UserId,
    mission_control_id: &MissionControlId,
    fee: &Tokens,
) -> bool {
    let account = get_existing_account(user, mission_control_id).ok_or(false)?;
    has_credits(&account, fee)
}

pub fn has_credits(account: &Account, fee: &Tokens) -> bool {
    account.credits.e8s() * fee.e8s() >= fee.e8s() * E8S_PER_ICP.e8s()
}

pub fn use_credits(user: &UserId) -> Result<Tokens, &'static str> {
    mutate_stable_state(|stable| update_credits_impl(user, false, &E8S_PER_ICP, stable))
}

pub fn add_credits(user: &UserId, credits: &Tokens) -> Result<Tokens, &'static str> {
    mutate_stable_state(|stable| update_credits_impl(user, true, credits, stable))
}

fn update_credits_impl(
    user: &UserId,
    increment: bool,
    credits: &Tokens,
    state: &mut StableState,
) -> Result<Tokens, &'static str> {
    let existing_account = state.accounts.get(user);

    match existing_account {
        None => Err("User does not have an account"),
        Some(account) => {
            let now = time();

            let remaining_credits_e8s = match increment {
                true => account.credits.e8s() + credits.e8s(),
                false => match account.credits.e8s() > credits.e8s() {
                    true => account.credits.e8s() - credits.e8s(),
                    false => 0,
                },
            };

            let remaining_credits = Tokens::from_e8s(remaining_credits_e8s);

            let update_account = Account {
                credits: remaining_credits,
                updated_at: now,
                ..account
            };

            state.accounts.insert(*user, update_account);

            Ok(remaining_credits)
        }
    }
}
