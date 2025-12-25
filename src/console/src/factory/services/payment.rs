use crate::factory::services::cycles_ledger::transfer_from_cycles_ledger;
use crate::factory::services::ledger::{transfer_from, verify_payment};
use crate::store::stable::is_known_payment;
use candid::Principal;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::env::{CYCLES_LEDGER, ICP_LEDGER};

pub async fn process_payment_icp(
    purchaser: Principal,
    block_index: Option<BlockIndex>,
    fee: Tokens,
) -> Result<(Principal, BlockIndex), String> {
    let purchaser_payment_block_index = if let Some(block_index) = block_index {
        if is_known_payment(&block_index) {
            return Err("Payment has been or is being processed.".to_string());
        }

        verify_payment(&purchaser, &block_index, fee).await?
    } else {
        transfer_from(&purchaser, &fee).await?
    };

    let ledger_id = Principal::from_text(ICP_LEDGER).unwrap();

    Ok((ledger_id, purchaser_payment_block_index))
}

pub async fn process_payment_cycles(
    purchaser: Principal,
    _block_index: Option<BlockIndex>,
    fee: Tokens,
) -> Result<(Principal, BlockIndex), String> {
    let purchaser_payment_block_index = transfer_from_cycles_ledger(&purchaser, &fee).await?;

    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    Ok((ledger_id, purchaser_payment_block_index))
}
