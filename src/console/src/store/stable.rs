use crate::constants::E8S_PER_ICP;
use crate::types::ledger::{Payment, PaymentStatus};
use crate::types::state::{MissionControl, StableState};
use crate::STATE;
use ic_cdk::api::time;
use ic_ledger_types::BlockIndex;
use junobuild_shared::types::state::MissionControlId;
use junobuild_shared::types::state::UserId;
use junobuild_shared::utils::principal_equal;

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
