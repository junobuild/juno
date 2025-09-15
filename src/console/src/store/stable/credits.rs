use crate::constants::E8S_PER_ICP;
use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::store::stable::get_existing_mission_control;
use crate::types::state::{MissionControl, StableState};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;
use junobuild_shared::types::state::{MissionControlId, UserId};

pub fn get_credits(user: &UserId) -> Result<Tokens, &'static str> {
    read_stable_state(|stable| get_credits_impl(user, stable))
}

fn get_credits_impl(user: &UserId, state: &StableState) -> Result<Tokens, &'static str> {
    let existing_mission_control = state.mission_controls.get(user);

    match existing_mission_control {
        None => Err("User does not have a mission control center"),
        Some(mission_control) => Ok(mission_control.credits),
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

pub fn has_credits(user: &UserId, mission_control: &MissionControlId, fee: &Tokens) -> bool {
    let mission_control = get_existing_mission_control(user, mission_control);

    match mission_control {
        Err(_) => false,
        Ok(mission_control) => {
            mission_control.credits.e8s() * fee.e8s() >= fee.e8s() * E8S_PER_ICP.e8s()
        }
    }
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
    let existing_mission_control = state.mission_controls.get(user);

    match existing_mission_control {
        None => Err("User does not have a mission control center"),
        Some(mission_control) => {
            let now = time();

            let remaining_credits_e8s = match increment {
                true => mission_control.credits.e8s() + credits.e8s(),
                false => match mission_control.credits.e8s() > credits.e8s() {
                    true => mission_control.credits.e8s() - credits.e8s(),
                    false => 0,
                },
            };

            let remaining_credits = Tokens::from_e8s(remaining_credits_e8s);

            let update_mission_control = MissionControl {
                mission_control_id: mission_control.mission_control_id,
                owner: mission_control.owner,
                credits: remaining_credits,
                created_at: mission_control.created_at,
                updated_at: now,
            };

            state.mission_controls.insert(*user, update_mission_control);

            Ok(remaining_credits)
        }
    }
}
