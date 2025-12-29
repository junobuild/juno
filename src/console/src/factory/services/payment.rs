use crate::factory::services::ledger::icp::{
    icp_transfer_from, icp_transfer_payment, icp_verify_payment,
};
use crate::store::stable::payments::{is_known_icp_payment, is_known_icrc_payment};
use crate::types::ledger::IcrcPaymentKey;
use candid::Principal;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::env::ICP_LEDGER;

pub async fn process_payment_icp(
    purchaser: Principal,
    block_index: Option<BlockIndex>,
    fee: Tokens,
) -> Result<(Principal, BlockIndex), String> {
    let ledger_id = Principal::from_text(ICP_LEDGER).unwrap();

    let purchaser_payment_block_index = if let Some(block_index) = block_index {
        if is_known_icp_payment(&block_index) {
            return Err("Payment has been or is being processed.".to_string());
        }

        if is_known_icrc_payment(&IcrcPaymentKey::from(&purchaser, &ledger_id, &block_index)) {
            return Err("ICRC Payment has been or is being processed.".to_string());
        }

        icp_verify_payment(&purchaser, &block_index, fee).await?
    } else {
        icp_transfer_from(&purchaser, &fee).await?
    };

    Ok((ledger_id, purchaser_payment_block_index))
}

pub async fn refund_payment_icp(
    purchaser: Principal,
    canister_fee: Tokens,
) -> Result<BlockIndex, String> {
    icp_transfer_payment(&purchaser, canister_fee).await
}
