use crate::constants::E8S_PER_ICP;
use crate::types::ledger::{Payment, PaymentStatus};
use crate::types::state::{
    Fee, Fees, InvitationCode, InvitationCodeRedeem, InvitationCodes, MissionControl,
    MissionControls, Rate, RateConfig, StableState, Wasm,
};
use crate::STATE;
use ic_cdk::api::time;
use ic_ledger_types::{BlockIndex, Tokens};
use shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use shared::types::interface::SetController;
use shared::types::state::UserId;
use shared::types::state::{ControllerId, MissionControlId};
use shared::utils::principal_equal;
use std::cmp::min;

/// Mission control centers

pub fn get_mission_control(user: &UserId) -> Result<Option<MissionControl>, &'static str> {
    STATE.with(|state| get_mission_control_impl(user, &state.borrow().stable))
}

fn get_mission_control_impl(
    user: &UserId,
    state: &StableState,
) -> Result<Option<MissionControl>, &'static str> {
    let mission_control = state.mission_controls.get(user);

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

pub fn get_existing_mission_control(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<MissionControl, &'static str> {
    STATE.with(|state| {
        get_existing_mission_control_impl(user, mission_control_id, &state.borrow().stable)
    })
}

fn get_existing_mission_control_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    state: &StableState,
) -> Result<MissionControl, &'static str> {
    let existing_mission_control = state.mission_controls.get(user);

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

pub fn list_mission_controls() -> MissionControls {
    STATE.with(|state| list_mission_controls_impl(&state.borrow().stable))
}

fn list_mission_controls_impl(state: &StableState) -> MissionControls {
    state.mission_controls.clone()
}

pub fn init_empty_mission_control(user: &UserId) {
    STATE.with(|state| init_empty_mission_control_impl(user, &mut state.borrow_mut().stable))
}

fn init_empty_mission_control_impl(user: &UserId, state: &mut StableState) {
    let now = time();

    let mission_control = MissionControl {
        mission_control_id: None,
        owner: *user,
        credits: E8S_PER_ICP,
        created_at: now,
        updated_at: now,
    };

    state.mission_controls.insert(*user, mission_control);
}

pub fn add_mission_control(user: &UserId, mission_control_id: &MissionControlId) -> MissionControl {
    STATE.with(|state| {
        add_mission_control_impl(user, mission_control_id, &mut state.borrow_mut().stable)
    })
}

fn add_mission_control_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    state: &mut StableState,
) -> MissionControl {
    let now = time();

    // We know for sure that we have created an empty mission control center
    let mission_control = state.mission_controls.get(user).unwrap();

    let finalized_mission_control = MissionControl {
        owner: mission_control.owner,
        mission_control_id: Some(*mission_control_id),
        credits: mission_control.credits,
        created_at: mission_control.created_at,
        updated_at: now,
    };

    state
        .mission_controls
        .insert(*user, finalized_mission_control.clone());

    finalized_mission_control
}

pub fn delete_mission_control(user: &UserId) -> Option<MissionControl> {
    STATE.with(|state| delete_mission_control_impl(user, &mut state.borrow_mut().stable))
}

fn delete_mission_control_impl(user: &UserId, state: &mut StableState) -> Option<MissionControl> {
    state.mission_controls.remove(user)
}

/// Credits

pub fn get_credits(user: &UserId) -> Result<Tokens, &'static str> {
    STATE.with(|state| get_credits_impl(user, &state.borrow().stable))
}

fn get_credits_impl(user: &UserId, state: &StableState) -> Result<Tokens, &'static str> {
    let existing_mission_control = state.mission_controls.get(user);

    match existing_mission_control {
        None => Err("User does not have a mission control center"),
        Some(mission_control) => Ok(mission_control.credits),
    }
}

/// Originally credits were equals to the fees. 0.5 ICP for a satellite covered by 0.5 credits.
/// However, given that fees can now be dynamically set, the credits had to be indexed.
/// That is why now one credit covers the creation fee regardless the ICP price.
///
/// For example:
/// - satellite fee is 2 ICP, 1 credit covers it
/// - satellite fee is 9 ICP, 1 credit covers it
/// - satellite fee is 2 ICP, 0.1 credits does no cover it
///
/// More like a percent. 1 credit equals 1 creation.

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
    STATE.with(|state| {
        update_credits_impl(user, false, &E8S_PER_ICP, &mut state.borrow_mut().stable)
    })
}

pub fn add_credits(user: &UserId, credits: &Tokens) -> Result<Tokens, &'static str> {
    STATE.with(|state| update_credits_impl(user, true, credits, &mut state.borrow_mut().stable))
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

/// Transactions

pub fn is_known_payment(block_index: &BlockIndex) -> bool {
    STATE.with(|state| state.borrow_mut().stable.payments.contains_key(block_index))
}

pub fn insert_new_payment(
    user: &UserId,
    block_index: &BlockIndex,
) -> Result<Payment, &'static str> {
    STATE.with(|state| insert_new_payment_impl(user, block_index, &mut state.borrow_mut().stable))
}

fn insert_new_payment_impl(
    user: &UserId,
    block_index: &BlockIndex,
    state: &mut StableState,
) -> Result<Payment, &'static str> {
    let existing_mission_control = state.mission_controls.get(user);

    match existing_mission_control {
        None => Err("User does not have a mission control center"),
        Some(mission_control) => {
            let now = time();

            let new_payment = Payment {
                mission_control_id: mission_control.mission_control_id,
                block_index_payment: *block_index,
                block_index_refunded: None,
                status: PaymentStatus::Acknowledged,
                created_at: now,
                updated_at: now,
            };

            state.payments.insert(*block_index, new_payment.clone());

            Ok(new_payment)
        }
    }
}

pub fn update_payment_completed(block_index: &BlockIndex) -> Result<Payment, &'static str> {
    STATE.with(|state| update_payment_completed_impl(block_index, &mut state.borrow_mut().stable))
}

fn update_payment_completed_impl(
    block_index: &BlockIndex,
    state: &mut StableState,
) -> Result<Payment, &'static str> {
    let payment = state.payments.get(block_index);

    match payment {
        None => Err("Payment not found."),
        Some(payment) => {
            let now = time();

            let updated_payment = Payment {
                mission_control_id: payment.mission_control_id,
                block_index_payment: payment.block_index_payment,
                block_index_refunded: Some(payment.block_index_payment),
                status: PaymentStatus::Completed,
                created_at: payment.created_at,
                updated_at: now,
            };

            state.payments.insert(*block_index, updated_payment.clone());

            Ok(updated_payment)
        }
    }
}

pub fn update_payment_refunded(
    block_index_payment: &BlockIndex,
    block_index_refunded: &BlockIndex,
) -> Result<Payment, &'static str> {
    STATE.with(|state| {
        update_payment_refunded_impl(
            block_index_payment,
            block_index_refunded,
            &mut state.borrow_mut().stable,
        )
    })
}

fn update_payment_refunded_impl(
    block_index_payment: &BlockIndex,
    block_index_refunded: &BlockIndex,
    state: &mut StableState,
) -> Result<Payment, &'static str> {
    let payment = state.payments.get(block_index_payment);

    match payment {
        None => Err("Payment to refund not found."),
        Some(payment) => {
            let now = time();

            let updated_payment = Payment {
                mission_control_id: payment.mission_control_id,
                block_index_payment: payment.block_index_payment,
                block_index_refunded: Some(*block_index_refunded),
                status: PaymentStatus::Refunded,
                created_at: payment.created_at,
                updated_at: now,
            };

            state
                .payments
                .insert(*block_index_payment, updated_payment.clone());

            Ok(updated_payment)
        }
    }
}

/// Wasm

pub fn reset_satellite_release() {
    STATE.with(|state| reset_satellite_release_impl(&mut state.borrow_mut().stable))
}

pub fn get_satellite_release_version() -> Option<String> {
    STATE.with(|state| state.borrow().stable.releases.satellite.version.clone())
}

fn reset_satellite_release_impl(state: &mut StableState) {
    state.releases.satellite = Wasm {
        wasm: Vec::new(),
        version: None,
    };
}

pub fn load_satellite_release(blob: &[u8], version: &str) {
    STATE.with(|state| load_satellite_release_impl(blob, version, &mut state.borrow_mut().stable))
}

fn load_satellite_release_impl(blob: &[u8], version: &str, state: &mut StableState) {
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
    STATE.with(|state| reset_mission_control_release_impl(&mut state.borrow_mut().stable))
}

pub fn get_mission_control_release_version() -> Option<String> {
    STATE.with(|state| {
        state
            .borrow()
            .stable
            .releases
            .mission_control
            .version
            .clone()
    })
}

fn reset_mission_control_release_impl(state: &mut StableState) {
    state.releases.mission_control = Wasm {
        wasm: Vec::new(),
        version: None,
    };
}

pub fn load_mission_control_release(blob: &[u8], version: &str) {
    STATE.with(|state| {
        load_mission_control_release_impl(blob, version, &mut state.borrow_mut().stable)
    })
}

fn load_mission_control_release_impl(blob: &[u8], version: &str, state: &mut StableState) {
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
    STATE.with(|state| reset_orbiter_release_impl(&mut state.borrow_mut().stable))
}

fn reset_orbiter_release_impl(state: &mut StableState) {
    state.releases.orbiter = Wasm {
        wasm: Vec::new(),
        version: None,
    };
}

pub fn get_orbiter_release_version() -> Option<String> {
    STATE.with(|state| state.borrow().stable.releases.orbiter.version.clone())
}

pub fn load_orbiter_release(blob: &[u8], version: &str) {
    STATE.with(|state| load_orbiter_release_impl(blob, version, &mut state.borrow_mut().stable))
}

fn load_orbiter_release_impl(blob: &[u8], version: &str, state: &mut StableState) {
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
    STATE.with(|state| {
        add_invitation_code_impl(code, &mut state.borrow_mut().stable.invitation_codes)
    })
}

pub fn redeem_invitation_code(user_id: &UserId, code: &InvitationCode) -> Result<(), &'static str> {
    STATE.with(|state| {
        redeem_invitation_code_impl(
            user_id,
            code,
            &mut state.borrow_mut().stable.invitation_codes,
        )
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

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().stable.controllers,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(
            remove_controllers,
            &mut state.borrow_mut().stable.controllers,
        )
    })
}

/// Rates

pub fn increment_satellites_rate() -> Result<(), String> {
    STATE.with(|state| increment_rate_impl(&mut state.borrow_mut().stable.rates.satellites))
}

pub fn increment_mission_controls_rate() -> Result<(), String> {
    STATE.with(|state| increment_rate_impl(&mut state.borrow_mut().stable.rates.mission_controls))
}

pub fn increment_orbiters_rate() -> Result<(), String> {
    STATE.with(|state| increment_rate_impl(&mut state.borrow_mut().stable.rates.orbiters))
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
    STATE.with(|state| update_rate_config(config, &mut state.borrow_mut().stable.rates.satellites))
}

pub fn update_mission_controls_rate_config(config: &RateConfig) {
    STATE.with(|state| {
        update_rate_config(
            config,
            &mut state.borrow_mut().stable.rates.mission_controls,
        )
    })
}

pub fn update_orbiters_rate_config(config: &RateConfig) {
    STATE.with(|state| update_rate_config(config, &mut state.borrow_mut().stable.rates.orbiters))
}

fn update_rate_config(config: &RateConfig, rate: &mut Rate) {
    rate.config = config.clone();
}

/// Fees

pub fn get_satellite_fee() -> Tokens {
    STATE.with(|state| state.borrow().stable.fees.satellite.fee)
}

pub fn get_orbiter_fee() -> Tokens {
    STATE.with(|state| state.borrow().stable.fees.orbiter.fee)
}

pub fn set_create_satellite_fee(fee: &Tokens) {
    STATE.with(|state| set_satellite_fee(fee, &mut state.borrow_mut().stable.fees))
}

pub fn set_create_orbiter_fee(fee: &Tokens) {
    STATE.with(|state| set_orbiter_fee(fee, &mut state.borrow_mut().stable.fees))
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
