use crate::accounts::get_account_with_existing_mission_control;
use crate::constants::E8S_PER_ICP;
use crate::store::{with_accounts, with_accounts_mut};
use crate::types::ledger::Fee;
use crate::types::state::{Account, AccountsStable};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;
use junobuild_shared::types::state::{MissionControlId, UserId};

pub fn get_credits(user: &UserId) -> Result<Tokens, &'static str> {
    with_accounts(|accounts| get_credits_impl(user, accounts))
}

fn get_credits_impl(user: &UserId, accounts: &AccountsStable) -> Result<Tokens, &'static str> {
    accounts
        .get(user)
        .map(|account| account.credits)
        .ok_or("User does not have an account")
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

pub fn caller_is_mission_control_and_user_has_credits(
    user: &UserId,
    caller: &MissionControlId,
    fee: &Fee,
) -> Result<bool, String> {
    let account = get_account_with_existing_mission_control(user, caller)?;
    Ok(has_credits(&account, fee))
}

pub fn has_credits(account: &Account, fee: &Fee) -> bool {
    let fee_amount = fee.amount();
    account.credits.e8s() * fee_amount >= fee_amount * E8S_PER_ICP.e8s()
}

pub fn use_credits(user: &UserId) -> Result<Tokens, &'static str> {
    with_accounts_mut(|accounts| update_credits_impl(user, false, &E8S_PER_ICP, accounts))
}

pub fn add_credits(user: &UserId, credits: &Tokens) -> Result<Tokens, &'static str> {
    with_accounts_mut(|accounts| update_credits_impl(user, true, credits, accounts))
}

fn update_credits_impl(
    user: &UserId,
    increment: bool,
    credits: &Tokens,
    accounts: &mut AccountsStable,
) -> Result<Tokens, &'static str> {
    let existing_account = accounts.get(user);

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

            accounts.insert(*user, update_account);

            Ok(remaining_credits)
        }
    }
}
