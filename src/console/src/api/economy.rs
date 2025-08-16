use crate::guards::caller_is_admin_controller;
use crate::store::heap::{
    get_orbiter_fee, get_satellite_fee, set_create_orbiter_fee, set_create_satellite_fee,
};
use crate::store::stable::{
    add_credits as add_credits_store, get_credits as get_credits_store, has_credits,
    list_payments as list_payments_state,
};
use crate::types::state::Payments;
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use ic_ledger_types::Tokens;
use junobuild_shared::ic::caller;
use junobuild_shared::types::interface::GetCreateCanisterFeeArgs;
use junobuild_shared::types::state::{SegmentKind, UserId};

#[query(guard = "caller_is_admin_controller")]
fn list_payments() -> Payments {
    list_payments_state()
}

#[query]
fn get_credits() -> Tokens {
    let caller = caller();

    get_credits_store(&caller).unwrap_or_else(|e| trap(e))
}

#[update(guard = "caller_is_admin_controller")]
fn add_credits(user: UserId, credits: Tokens) {
    add_credits_store(&user, &credits).unwrap_or_else(|e| trap(e));
}

#[query]
fn get_create_satellite_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_satellite_fee();

    match has_credits(&user, &caller, &fee) {
        false => Some(fee),
        true => None,
    }
}

#[query]
fn get_create_orbiter_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_orbiter_fee();

    match has_credits(&user, &caller, &fee) {
        false => Some(fee),
        true => None,
    }
}

#[update(guard = "caller_is_admin_controller")]
fn set_fee(segment: SegmentKind, fee: Tokens) {
    match segment {
        SegmentKind::Satellite => set_create_satellite_fee(&fee),
        SegmentKind::MissionControl => trap("Fee for mission control not supported."),
        SegmentKind::Orbiter => set_create_orbiter_fee(&fee),
    }
}
