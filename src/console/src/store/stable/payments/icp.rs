use crate::store::with_icp_payments;
use crate::types::state::{IcpPayments, IcpPaymentsStable};
use ic_ledger_types::BlockIndex;
use junobuild_shared::structures::collect_stable_map_from;

pub fn is_known_icp_payment(block_index: &BlockIndex) -> bool {
    with_icp_payments(|payments| payments.contains_key(block_index))
}

pub fn list_icp_payments() -> IcpPayments {
    with_icp_payments(list_icp_payments_impl)
}

fn list_icp_payments_impl(payments: &IcpPaymentsStable) -> IcpPayments {
    collect_stable_map_from(payments)
}
