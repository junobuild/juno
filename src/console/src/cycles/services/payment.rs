use crate::cycles::services::ledger::icrc::icrc_transfer_from;
use crate::cycles::services::ledger::types::TransferFromToConsole;
use candid::{Nat, Principal};
use ic_ledger_types::BlockIndex;
use icrc_ledger_types::icrc1::account::Account;
use junobuild_shared::constants::shared::IC_TRANSACTION_FEE_ICP;
use junobuild_shared::env::ICP_LEDGER;

pub async fn process_payment_icp(
    from: &Account,
    amount: &Nat,
) -> Result<(Principal, BlockIndex), String> {
    let transaction_fee = Nat::from(IC_TRANSACTION_FEE_ICP.e8s());
    let ledger_id = Principal::from_text(ICP_LEDGER).unwrap();

    let payload: TransferFromToConsole = TransferFromToConsole {
        ledger_id,
        from: from.clone(),
        amount: amount.clone(),
        transaction_fee,
    };

    let icrc_block_index = icrc_transfer_from(&payload).await?;

    let block_index: u64 =
        u64::try_from(icrc_block_index.0).map_err(|_| "Block index too large for u64")?;

    Ok((ledger_id, block_index))
}
