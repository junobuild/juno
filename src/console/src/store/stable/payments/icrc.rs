use crate::store::{mutate_stable_state, with_icrc_payments, with_icrc_payments_mut};
use crate::types::ledger::{IcrcPayment, IcrcPaymentKey, PaymentStatus};
use crate::types::state::{IcrcPayments, IcrcPaymentsStable, StableState};
use candid::Principal;
use ic_cdk::api::time;
use ic_ledger_types::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use junobuild_shared::structures::collect_stable_map_from;

pub fn is_known_icrc_payment(key: &IcrcPaymentKey) -> bool {
    with_icrc_payments(|payments| payments.contains_key(key))
}

pub fn insert_new_icrc_payment(
    key: &IcrcPaymentKey,
    purchaser: &Principal,
) -> Result<IcrcPayment, &'static str> {
    mutate_stable_state(|stable| insert_new_icrc_payment_impl(key, purchaser, stable))
}

fn insert_new_icrc_payment_impl(
    key: &IcrcPaymentKey,
    purchaser: &Principal,
    state: &mut StableState,
) -> Result<IcrcPayment, &'static str> {
    let now = time();

    let new_payment = IcrcPayment {
        purchaser: Account::from(*purchaser),
        block_index_refunded: None,
        status: PaymentStatus::Acknowledged,
        created_at: now,
        updated_at: now,
    };

    state.icrc_payments.insert(key.clone(), new_payment.clone());

    Ok(new_payment)
}

pub fn update_icrc_payment_completed(key: &IcrcPaymentKey) -> Result<IcrcPayment, &'static str> {
    with_icrc_payments_mut(|payments| update_icrc_payment_completed_impl(key, payments))
}

fn update_icrc_payment_completed_impl(
    key: &IcrcPaymentKey,
    payments: &mut IcrcPaymentsStable,
) -> Result<IcrcPayment, &'static str> {
    let payment = payments.get(key).ok_or("ICRC Payment not found.")?;

    let now = time();

    let updated_payment = IcrcPayment {
        status: PaymentStatus::Completed,
        updated_at: now,
        ..payment
    };

    payments.insert(key.clone(), updated_payment.clone());

    Ok(updated_payment)
}

pub fn update_icrc_payment_refunded(
    key: &IcrcPaymentKey,
    block_index_refunded: &BlockIndex,
) -> Result<IcrcPayment, &'static str> {
    with_icrc_payments_mut(|payments| {
        update_icrc_payment_refunded_impl(key, block_index_refunded, payments)
    })
}

fn update_icrc_payment_refunded_impl(
    key: &IcrcPaymentKey,
    block_index_refunded: &BlockIndex,
    payments: &mut IcrcPaymentsStable,
) -> Result<IcrcPayment, &'static str> {
    let payment = payments
        .get(key)
        .ok_or("ICRC Payment to refund not found.")?;

    let now = time();

    let updated_payment = IcrcPayment {
        block_index_refunded: Some(*block_index_refunded),
        status: PaymentStatus::Refunded,
        created_at: payment.created_at,
        updated_at: now,
        ..payment
    };

    payments.insert(key.clone(), updated_payment.clone());

    Ok(updated_payment)
}

pub fn list_icrc_payments() -> IcrcPayments {
    with_icrc_payments(list_payments_impl)
}

fn list_payments_impl(payments: &IcrcPaymentsStable) -> IcrcPayments {
    collect_stable_map_from(payments)
}
