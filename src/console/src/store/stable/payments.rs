use crate::store::services::mutate_stable_state;
use crate::store::{with_payments, with_payments_mut};
use crate::types::ledger::{Payment, PaymentStatus};
use crate::types::state::{Payments, PaymentsStable, StableState};
use candid::Principal;
use ic_cdk::api::time;
use ic_ledger_types::BlockIndex;
use junobuild_shared::structures::collect_stable_map_from;
use junobuild_shared::types::state::UserId;

pub fn is_known_payment(block_index: &BlockIndex) -> bool {
    with_payments(|payments| payments.contains_key(block_index))
}

pub fn insert_new_payment(
    user: &UserId,
    block_index: &BlockIndex,
) -> Result<Payment, &'static str> {
    mutate_stable_state(|stable| insert_new_payment_impl(user, block_index, stable))
}

fn insert_new_payment_impl(
    purchaser: &Principal,
    block_index: &BlockIndex,
    state: &mut StableState,
) -> Result<Payment, &'static str> {
    let now = time();

    let new_payment = Payment {
        mission_control_id: Some(purchaser.clone()),
        block_index_payment: *block_index,
        block_index_refunded: None,
        status: PaymentStatus::Acknowledged,
        created_at: now,
        updated_at: now,
    };

    state.payments.insert(*block_index, new_payment.clone());

    Ok(new_payment)
}

pub fn update_payment_completed(block_index: &BlockIndex) -> Result<Payment, &'static str> {
    with_payments_mut(|payments| update_payment_completed_impl(block_index, payments))
}

fn update_payment_completed_impl(
    block_index: &BlockIndex,
    payments: &mut PaymentsStable,
) -> Result<Payment, &'static str> {
    let payment = payments.get(block_index).ok_or("Payment not found.")?;

    let now = time();

    let updated_payment = Payment {
        mission_control_id: payment.mission_control_id,
        block_index_payment: payment.block_index_payment,
        block_index_refunded: None,
        status: PaymentStatus::Completed,
        created_at: payment.created_at,
        updated_at: now,
    };

    payments.insert(*block_index, updated_payment.clone());

    Ok(updated_payment)
}

pub fn update_payment_refunded(
    block_index_payment: &BlockIndex,
    block_index_refunded: &BlockIndex,
) -> Result<Payment, &'static str> {
    with_payments_mut(|payments| {
        update_payment_refunded_impl(block_index_payment, block_index_refunded, payments)
    })
}

fn update_payment_refunded_impl(
    block_index_payment: &BlockIndex,
    block_index_refunded: &BlockIndex,
    payments: &mut PaymentsStable,
) -> Result<Payment, &'static str> {
    let payment = payments
        .get(block_index_payment)
        .ok_or("Payment to refund not found.")?;

    let now = time();

    let updated_payment = Payment {
        mission_control_id: payment.mission_control_id,
        block_index_payment: payment.block_index_payment,
        block_index_refunded: Some(*block_index_refunded),
        status: PaymentStatus::Refunded,
        created_at: payment.created_at,
        updated_at: now,
    };

    payments.insert(*block_index_payment, updated_payment.clone());

    Ok(updated_payment)
}

pub fn list_payments() -> Payments {
    with_payments(list_payments_impl)
}

fn list_payments_impl(payments: &PaymentsStable) -> Payments {
    collect_stable_map_from(payments)
}
