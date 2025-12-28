use crate::accounts::credits::{
    add_credits as add_credits_store, caller_has_credits,
    caller_is_mission_control_and_user_has_credits, get_credits as get_credits_store,
};
use crate::guards::caller_is_admin_controller;
use crate::store::heap::{
    get_mission_control_fee, get_orbiter_fee, get_satellite_fee, set_create_mission_control_fee,
    set_create_orbiter_fee, set_create_satellite_fee,
};
use crate::store::stable::list_payments as list_payments_state;
use crate::types::interface::{FeeKind, FeesArgs};
use crate::types::state::Payments;
use ic_cdk_macros::{query, update};
use ic_ledger_types::Tokens;
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::GetCreateCanisterFeeArgs;
use junobuild_shared::types::state::{SegmentKind, UserId};

#[query(guard = "caller_is_admin_controller")]
fn list_payments() -> Payments {
    list_payments_state()
}

#[query]
fn get_credits() -> Tokens {
    let caller = caller();

    get_credits_store(&caller).unwrap_or_trap()
}

#[update(guard = "caller_is_admin_controller")]
fn add_credits(user: UserId, credits: Tokens) {
    add_credits_store(&user, &credits).unwrap_or_trap();
}

#[query]
fn get_create_fee(segment: SegmentKind, fee_kind: FeeKind) -> Option<Tokens> {
    let caller = caller();

    let fee = match segment {
        SegmentKind::Orbiter => get_orbiter_fee(fee_kind),
        SegmentKind::Satellite => get_satellite_fee(fee_kind),
        SegmentKind::MissionControl => get_mission_control_fee(fee_kind),
    };

    let has_enough_credits = caller_has_credits(&caller, &fee).unwrap_or_trap();

    if has_enough_credits {
        return None;
    }

    Some(fee)
}

#[deprecated(note = "Deprecated. Used by Mission Control before merge to Monitoring.")]
#[query]
fn get_create_satellite_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_satellite_fee(FeeKind::ICP);

    let has_enough_credits =
        caller_is_mission_control_and_user_has_credits(&user, &caller, &fee).unwrap_or_trap();

    match has_enough_credits {
        true => None,
        false => Some(fee),
    }
}

#[deprecated(note = "Deprecated. Used by Mission Control before merge to Monitoring.")]
#[query]
fn get_create_orbiter_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_orbiter_fee(FeeKind::ICP);

    let has_enough_credits =
        caller_is_mission_control_and_user_has_credits(&user, &caller, &fee).unwrap_or_trap();

    match has_enough_credits {
        true => None,
        false => Some(fee),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn set_fee(segment: SegmentKind, fees: FeesArgs) {
    match segment {
        SegmentKind::Satellite => set_create_satellite_fee(&fees),
        SegmentKind::MissionControl => set_create_mission_control_fee(&fees),
        SegmentKind::Orbiter => set_create_orbiter_fee(&fees),
    }
}
