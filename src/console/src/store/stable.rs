use crate::constants::E8S_PER_ICP;
use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::types::ledger::{Payment, PaymentStatus};
use crate::types::state::{
    MissionControl, MissionControls, MissionControlsStable, Payments, PaymentsStable, StableState,
};
use ic_cdk::api::time;
use ic_ledger_types::BlockIndex;
use ic_ledger_types::Tokens;
use junobuild_shared::structures::collect_stable_map_from;
use junobuild_shared::types::state::MissionControlId;
use junobuild_shared::types::state::UserId;
use junobuild_shared::utils::principal_equal;

// ---------------------------------------------------------
// Mission control centers
// ---------------------------------------------------------

pub fn get_mission_control(user: &UserId) -> Result<Option<MissionControl>, &'static str> {
    read_stable_state(|stable| get_mission_control_impl(user, stable))
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
    read_stable_state(|stable| get_existing_mission_control_impl(user, mission_control_id, stable))
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

pub fn init_empty_mission_control(user: &UserId) {
    mutate_stable_state(|stable| init_empty_mission_control_impl(user, stable))
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
    mutate_stable_state(|stable| add_mission_control_impl(user, mission_control_id, stable))
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
    mutate_stable_state(|stable| delete_mission_control_impl(user, stable))
}

fn delete_mission_control_impl(user: &UserId, state: &mut StableState) -> Option<MissionControl> {
    state.mission_controls.remove(user)
}

pub fn list_mission_controls() -> MissionControls {
    read_stable_state(|stable| list_mission_controls_impl(&stable.mission_controls))
}

fn list_mission_controls_impl(mission_controls: &MissionControlsStable) -> MissionControls {
    collect_stable_map_from(mission_controls)
}

// ---------------------------------------------------------
// Credits
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Transactions
// ---------------------------------------------------------

pub fn is_known_payment(block_index: &BlockIndex) -> bool {
    read_stable_state(|stable| stable.payments.contains_key(block_index))
}

pub fn insert_new_payment(
    user: &UserId,
    block_index: &BlockIndex,
) -> Result<Payment, &'static str> {
    mutate_stable_state(|stable| insert_new_payment_impl(user, block_index, stable))
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
    mutate_stable_state(|stable| update_payment_completed_impl(block_index, stable))
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
    mutate_stable_state(|stable| {
        update_payment_refunded_impl(block_index_payment, block_index_refunded, stable)
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

pub fn list_payments() -> Payments {
    read_stable_state(|stable| list_payments_impl(&stable.payments))
}

fn list_payments_impl(payments: &PaymentsStable) -> Payments {
    collect_stable_map_from(payments)
}
