use crate::factory::services::ledger::cycles::{cycles_transfer_from, icrc_transfer_payment};
use crate::factory::services::ledger::icp::{
    icp_transfer_from, icp_transfer_payment, icp_verify_payment,
};
use crate::store::stable::is_known_payment;
use crate::types::ledger::Fee;
use candid::Principal;
use ic_ledger_types::BlockIndex;
use junobuild_shared::env::{CYCLES_LEDGER, ICP_LEDGER};

pub async fn process_payment_icp(
    purchaser: Principal,
    block_index: Option<BlockIndex>,
    fee: Fee,
) -> Result<(Principal, BlockIndex), String> {
    let tokens = fee.as_icp()?;

    let purchaser_payment_block_index = if let Some(block_index) = block_index {
        if is_known_payment(&block_index) {
            return Err("Payment has been or is being processed.".to_string());
        }

        icp_verify_payment(&purchaser, &block_index, tokens).await?
    } else {
        icp_transfer_from(&purchaser, &tokens).await?
    };

    let ledger_id = Principal::from_text(ICP_LEDGER).unwrap();

    Ok((ledger_id, purchaser_payment_block_index))
}

pub async fn process_payment_cycles(
    purchaser: Principal,
    _block_index: Option<BlockIndex>,
    fee: Fee,
) -> Result<(Principal, BlockIndex), String> {
    let cycles = fee.as_cycles()?;

    let purchaser_payment_block_index = cycles_transfer_from(&purchaser, &cycles).await?;

    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    Ok((ledger_id, purchaser_payment_block_index))
}

pub async fn refund_payment_icp(
    purchaser: Principal,
    canister_fee: Fee,
) -> Result<BlockIndex, String> {
    let tokens = canister_fee.as_icp()?;

    icp_transfer_payment(&purchaser, tokens).await
}

pub async fn refund_payment_cycles(
    purchaser: Principal,
    canister_fee: Fee,
) -> Result<BlockIndex, String> {
    let cycles = canister_fee.as_cycles()?;

    icrc_transfer_payment(&purchaser, cycles).await
}
