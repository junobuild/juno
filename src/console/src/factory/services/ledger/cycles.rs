use crate::factory::services::ledger::icrc::icrc_transfer_from;
use candid::{Nat, Principal};
use ic_ledger_types::{BlockIndex, Tokens};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::TransferArg;
use junobuild_shared::constants_shared::{IC_TRANSACTION_FEE_CYCLES, MEMO_SATELLITE_CREATE_REFUND};
use junobuild_shared::env::CYCLES_LEDGER;
use junobuild_shared::ledger::convert_memo_to_icrc;
use junobuild_shared::ledger::icrc::icrc_transfer_token;

pub async fn icrc_transfer_payment(
    purchaser: &Principal,
    canister_fee: Tokens,
) -> Result<BlockIndex, String> {
    let purchaser_account: Account = Account::from(*purchaser);

    // We refund the satellite creation fee minus the ic fee - i.e. user pays the fee
    let refund_amount = canister_fee - IC_TRANSACTION_FEE_CYCLES;
    let amount = Nat::from(refund_amount.e8s());

    let transaction_fee = Nat::from(IC_TRANSACTION_FEE_CYCLES.e8s());

    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    let args: TransferArg = TransferArg {
        to: purchaser_account,
        amount,
        fee: Some(transaction_fee),
        created_at_time: None,
        from_subaccount: None,
        memo: Some(convert_memo_to_icrc(&MEMO_SATELLITE_CREATE_REFUND)),
    };

    // Refund on error
    let refund_block_index = icrc_transfer_token(ledger_id, args)
        .await
        .map_err(|e| format!("failed to call ICRC ledger: {e:?}"))?
        .map_err(|e| format!("ICRC ledger transfer error {e:?}"))?;

    let block_index: u64 =
        u64::try_from(refund_block_index.0).map_err(|_| "Block index too large for u64")?;

    Ok(block_index)
}

pub async fn cycles_transfer_from(
    purchaser: &Principal,
    canister_fee: &Tokens,
) -> Result<BlockIndex, String> {
    let transaction_fee = Nat::from(IC_TRANSACTION_FEE_CYCLES.e8s());
    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    icrc_transfer_from(purchaser, &ledger_id, canister_fee, &transaction_fee).await
}
