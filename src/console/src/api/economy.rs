use crate::accounts::credits::{
    add_credits as add_credits_store, caller_is_mission_control_and_user_has_credits,
    get_credits as get_credits_store,
};
use crate::constants::{ORBITER_CREATION_FEE_ICP, SATELLITE_CREATION_FEE_ICP};
use crate::fees::{get_factory_fee, set_factory_fee};
use crate::guards::caller_is_admin_controller;
use crate::store::stable::payments::list_icp_payments as list_icp_payments_state;
use crate::store::stable::payments::list_icrc_payments as list_icrc_payments_state;
use crate::types::interface::FeesArgs;
use crate::types::ledger::Fee;
use crate::types::state::{FactoryFee, IcpPayments, IcrcPayments};
use ic_cdk_macros::{query, update};
use ic_ledger_types::Tokens;
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::GetCreateCanisterFeeArgs;
use junobuild_shared::types::state::{SegmentKind, UserId};

#[query(guard = "caller_is_admin_controller")]
fn list_icp_payments() -> IcpPayments {
    list_icp_payments_state()
}

#[query(guard = "caller_is_admin_controller")]
fn list_icrc_payments() -> IcrcPayments {
    list_icrc_payments_state()
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

#[deprecated(note = "Deprecated. Used by Mission Control before merge to Monitoring.")]
#[query]
fn get_create_satellite_fee(
    GetCreateCanisterFeeArgs { user }: GetCreateCanisterFeeArgs,
) -> Option<Tokens> {
    let caller = caller();

    let fee = get_factory_fee(&SegmentKind::Satellite)
        .unwrap_or_trap()
        .fee_icp
        .unwrap_or(SATELLITE_CREATION_FEE_ICP);

    let has_enough_credits =
        caller_is_mission_control_and_user_has_credits(&user, &caller, &Fee::ICP(fee))
            .unwrap_or_trap();

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

    let fee = get_factory_fee(&SegmentKind::Orbiter)
        .unwrap_or_trap()
        .fee_icp
        .unwrap_or(ORBITER_CREATION_FEE_ICP);

    let has_enough_credits =
        caller_is_mission_control_and_user_has_credits(&user, &caller, &Fee::ICP(fee))
            .unwrap_or_trap();

    match has_enough_credits {
        true => None,
        false => Some(fee),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn set_fee(segment: SegmentKind, fees: FeesArgs) {
    set_factory_fee(&segment, &fees).unwrap_or_trap();
}

#[query]
fn get_fee(segment_kind: SegmentKind) -> FactoryFee {
    get_factory_fee(&segment_kind).unwrap_or_trap()
}
