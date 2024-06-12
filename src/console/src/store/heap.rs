use crate::types::state::{
    Fee, Fees, HeapState, InvitationCode, InvitationCodeRedeem, InvitationCodes, MissionControls,
    Payments, Rate, RateConfig, Wasm,
};
use crate::STATE;
use candid::Principal;
use ic_cdk::api::time;
use ic_ledger_types::Tokens;
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::UserId;
use junobuild_shared::types::state::{ControllerId, Controllers};
use junobuild_storage::store::create_batch;
use junobuild_storage::types::interface::{CommitBatch, InitAssetKey};
use std::cmp::min;
use junobuild_storage::types::store::Asset;

/// Mission control centers

#[deprecated(note = "Use stable memory instead")]
pub fn list_mission_controls_heap() -> MissionControls {
    STATE.with(|state| list_mission_controls_heap_impl(&state.borrow().heap))
}

fn list_mission_controls_heap_impl(state: &HeapState) -> MissionControls {
    state.mission_controls.clone()
}

/// Transactions

#[deprecated(note = "Use stable memory instead")]
pub fn list_payments_heap() -> Payments {
    STATE.with(|state| list_payments_heap_impl(&state.borrow().heap))
}

fn list_payments_heap_impl(state: &HeapState) -> Payments {
    state.payments.clone()
}

/// Wasm

pub fn reset_satellite_release() {
    STATE.with(|state| reset_satellite_release_impl(&mut state.borrow_mut().heap))
}

pub fn get_satellite_release_version() -> Option<String> {
    STATE.with(|state| state.borrow().heap.releases.satellite.version.clone())
}

fn reset_satellite_release_impl(state: &mut HeapState) {
    state.releases.satellite = Wasm {
        wasm: Vec::new(),
        version: None,
    };
}

pub fn load_satellite_release(blob: &[u8], version: &str) {
    STATE.with(|state| load_satellite_release_impl(blob, version, &mut state.borrow_mut().heap))
}

fn load_satellite_release_impl(blob: &[u8], version: &str, state: &mut HeapState) {
    let wasm = state
        .releases
        .satellite
        .wasm
        .iter()
        .copied()
        .chain(blob.iter().copied())
        .collect();

    state.releases.satellite = Wasm {
        wasm,
        version: Some(version.to_owned()),
    };
}

// TODO: there is probably a way to refactor this to avoid duplicate code

pub fn reset_mission_control_release() {
    STATE.with(|state| reset_mission_control_release_impl(&mut state.borrow_mut().heap))
}

pub fn get_mission_control_release_version() -> Option<String> {
    STATE.with(|state| state.borrow().heap.releases.mission_control.version.clone())
}

fn reset_mission_control_release_impl(state: &mut HeapState) {
    state.releases.mission_control = Wasm {
        wasm: Vec::new(),
        version: None,
    };
}

pub fn load_mission_control_release(blob: &[u8], version: &str) {
    STATE.with(|state| {
        load_mission_control_release_impl(blob, version, &mut state.borrow_mut().heap)
    })
}

fn load_mission_control_release_impl(blob: &[u8], version: &str, state: &mut HeapState) {
    let wasm = state
        .releases
        .mission_control
        .wasm
        .iter()
        .copied()
        .chain(blob.iter().copied())
        .collect();

    state.releases.mission_control = Wasm {
        wasm,
        version: Some(version.to_owned()),
    };
}

/// Orbiter

pub fn reset_orbiter_release() {
    STATE.with(|state| reset_orbiter_release_impl(&mut state.borrow_mut().heap))
}

fn reset_orbiter_release_impl(state: &mut HeapState) {
    state.releases.orbiter = Wasm {
        wasm: Vec::new(),
        version: None,
    };
}

pub fn get_orbiter_release_version() -> Option<String> {
    STATE.with(|state| state.borrow().heap.releases.orbiter.version.clone())
}

pub fn load_orbiter_release(blob: &[u8], version: &str) {
    STATE.with(|state| load_orbiter_release_impl(blob, version, &mut state.borrow_mut().heap))
}

fn load_orbiter_release_impl(blob: &[u8], version: &str, state: &mut HeapState) {
    let wasm = state
        .releases
        .orbiter
        .wasm
        .iter()
        .copied()
        .chain(blob.iter().copied())
        .collect();

    state.releases.orbiter = Wasm {
        wasm,
        version: Some(version.to_owned()),
    };
}

/// Invitation codes

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

/// Controllers

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

/// Rates

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
    let new_tokens = (time() - rate.tokens.updated_at) / rate.config.time_per_token_ns;
    if new_tokens > 0 {
        // The number of tokens is capped otherwise tokens might accumulate
        rate.tokens.tokens = min(rate.config.max_tokens, rate.tokens.tokens + new_tokens);
        rate.tokens.updated_at += rate.config.time_per_token_ns * new_tokens;
    }

    // deduct a token for the current call
    if rate.tokens.tokens > 0 {
        rate.tokens.tokens -= 1;
        Ok(())
    } else {
        Err("Rate limit reached, try again later.".to_string())
    }
}

pub fn update_satellites_rate_config(config: &RateConfig) {
    STATE.with(|state| update_rate_config(config, &mut state.borrow_mut().heap.rates.satellites))
}

pub fn update_mission_controls_rate_config(config: &RateConfig) {
    STATE.with(|state| {
        update_rate_config(config, &mut state.borrow_mut().heap.rates.mission_controls)
    })
}

pub fn update_orbiters_rate_config(config: &RateConfig) {
    STATE.with(|state| update_rate_config(config, &mut state.borrow_mut().heap.rates.orbiters))
}

fn update_rate_config(config: &RateConfig, rate: &mut Rate) {
    rate.config = config.clone();
}

/// Fees

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
