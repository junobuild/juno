use crate::memory::manager::STATE;
use crate::types::state::{
    Fee, Fees, HeapState, InvitationCode, InvitationCodeRedeem, InvitationCodes, MissionControls,
    Payments, Rate, ReleaseVersion, ReleasesMetadata,
};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::rate::utils::increment_and_assert_rate;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::UserId;
use junobuild_shared::types::state::{ControllerId, Controllers};
use semver::Version;
use std::collections::HashSet;

// ---------------------------------------------------------
// Mission control centers
// ---------------------------------------------------------

#[deprecated(note = "Use stable memory instead")]
pub fn list_mission_controls_heap() -> MissionControls {
    STATE.with(|state| list_mission_controls_heap_impl(&state.borrow().heap))
}

fn list_mission_controls_heap_impl(state: &HeapState) -> MissionControls {
    state.mission_controls.clone()
}

// ---------------------------------------------------------
// Transactions
// ---------------------------------------------------------

#[deprecated(note = "Use stable memory instead")]
pub fn list_payments_heap() -> Payments {
    STATE.with(|state| list_payments_heap_impl(&state.borrow().heap))
}

fn list_payments_heap_impl(state: &HeapState) -> Payments {
    state.payments.clone()
}

// ---------------------------------------------------------
// Invitation codes
// ---------------------------------------------------------

pub fn add_invitation_code(code: &InvitationCode) {
    STATE
        .with(|state| add_invitation_code_impl(code, &mut state.borrow_mut().heap.invitation_codes))
}

pub fn redeem_invitation_code(user_id: &UserId, code: &InvitationCode) -> Result<(), &'static str> {
    STATE.with(|state| {
        redeem_invitation_code_impl(user_id, code, &mut state.borrow_mut().heap.invitation_codes)
    })
}

fn redeem_invitation_code_impl(
    user_id: &UserId,
    code: &InvitationCode,
    invitation_codes: &mut InvitationCodes,
) -> Result<(), &'static str> {
    let redeem = invitation_codes.get(code);

    match redeem {
        None => Err("Not a valid invitation code."),
        Some(redeem) => {
            if redeem.redeemed {
                return Err("Invitation code has already been used.");
            }

            let now = time();

            let mark_redeemed = InvitationCodeRedeem {
                redeemed: true,
                updated_at: now,
                created_at: redeem.created_at,
                user_id: Some(*user_id),
            };

            invitation_codes.insert(code.clone(), mark_redeemed);

            Ok(())
        }
    }
}

fn add_invitation_code_impl(code: &InvitationCode, invitation_codes: &mut InvitationCodes) {
    let now = time();

    let redeem = InvitationCodeRedeem {
        redeemed: false,
        updated_at: now,
        created_at: now,
        user_id: None,
    };

    invitation_codes.insert(code.clone(), redeem);
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

pub fn get_controllers() -> Controllers {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().heap.controllers,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(remove_controllers, &mut state.borrow_mut().heap.controllers)
    })
}

// ---------------------------------------------------------
// Rates
// ---------------------------------------------------------

pub fn increment_satellites_rate() -> Result<(), String> {
    STATE.with(|state| increment_rate_impl(&mut state.borrow_mut().heap.rates.satellites))
}

pub fn increment_mission_controls_rate() -> Result<(), String> {
    STATE.with(|state| increment_rate_impl(&mut state.borrow_mut().heap.rates.mission_controls))
}

pub fn increment_orbiters_rate() -> Result<(), String> {
    STATE.with(|state| increment_rate_impl(&mut state.borrow_mut().heap.rates.orbiters))
}

fn increment_rate_impl(rate: &mut Rate) -> Result<(), String> {
    increment_and_assert_rate(&rate.config, &mut rate.tokens)
}

pub fn update_satellites_rate_config(config: &RateConfig) {
    STATE.with(|state| {
        update_rate_config_impl(config, &mut state.borrow_mut().heap.rates.satellites)
    })
}

pub fn update_mission_controls_rate_config(config: &RateConfig) {
    STATE.with(|state| {
        update_rate_config_impl(config, &mut state.borrow_mut().heap.rates.mission_controls)
    })
}

pub fn update_orbiters_rate_config(config: &RateConfig) {
    STATE.with(|state| update_rate_config_impl(config, &mut state.borrow_mut().heap.rates.orbiters))
}

fn update_rate_config_impl(config: &RateConfig, rate: &mut Rate) {
    rate.config = config.clone();
}

// ---------------------------------------------------------
// Fees
// ---------------------------------------------------------

pub fn get_satellite_fee() -> Tokens {
    STATE.with(|state| state.borrow().heap.fees.satellite.fee)
}

pub fn get_orbiter_fee() -> Tokens {
    STATE.with(|state| state.borrow().heap.fees.orbiter.fee)
}

pub fn set_create_satellite_fee(fee: &Tokens) {
    STATE.with(|state| set_satellite_fee(fee, &mut state.borrow_mut().heap.fees))
}

pub fn set_create_orbiter_fee(fee: &Tokens) {
    STATE.with(|state| set_orbiter_fee(fee, &mut state.borrow_mut().heap.fees))
}

fn set_satellite_fee(fee: &Tokens, state: &mut Fees) {
    state.satellite = Fee {
        fee: *fee,
        updated_at: time(),
    };
}

fn set_orbiter_fee(fee: &Tokens, state: &mut Fees) {
    state.orbiter = Fee {
        fee: *fee,
        updated_at: time(),
    };
}

// ---------------------------------------------------------
// Releases metadata
// ---------------------------------------------------------

pub fn get_releases_metadata() -> ReleasesMetadata {
    STATE.with(|state| state.borrow().heap.releases_metadata.clone())
}

pub fn set_releases_metadata(metadata: &ReleasesMetadata) {
    STATE.with(|state| set_releases_metadata_impl(metadata, &mut state.borrow_mut().heap))
}

fn set_releases_metadata_impl(metadata: &ReleasesMetadata, heap_state: &mut HeapState) {
    heap_state.releases_metadata = metadata.clone();
}

pub fn get_latest_mission_control_version() -> Option<ReleaseVersion> {
    STATE.with(|state| get_latest_version(&state.borrow().heap.releases_metadata.mission_controls))
}

pub fn get_latest_orbiter_version() -> Option<ReleaseVersion> {
    STATE.with(|state| get_latest_version(&state.borrow().heap.releases_metadata.orbiters))
}

pub fn get_latest_satellite_version() -> Option<ReleaseVersion> {
    STATE.with(|state| get_latest_version(&state.borrow().heap.releases_metadata.satellites))
}

fn get_latest_version(versions: &HashSet<ReleaseVersion>) -> Option<ReleaseVersion> {
    versions
        .iter()
        .filter_map(|v| Version::parse(v).ok().map(|parsed| (parsed, v)))
        .max_by(|(parsed_a, _), (parsed_b, _)| parsed_a.cmp(parsed_b))
        .map(|(_, version)| version.clone())
}
