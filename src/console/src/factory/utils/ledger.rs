use candid::{Nat, Principal};
use ic_ledger_types::{BlockIndex, Tokens};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;
use junobuild_shared::constants_shared::{IC_TRANSACTION_FEE_ICP, MEMO_SATELLITE_CREATE_REFUND};
use junobuild_shared::env::ICP_LEDGER;
use junobuild_shared::ic::api::id;
use junobuild_shared::ledger::icp::{
    find_payment, principal_to_account_identifier, transfer_payment, SUB_ACCOUNT,
};
use junobuild_shared::ledger::icrc::icrc_transfer_token_from;

pub async fn verify_payment(
    purchaser: &Principal,
    purchaser_payment_block_index: &BlockIndex,
    fee: Tokens,
) -> Result<BlockIndex, String> {
    let purchaser_account_identifier = principal_to_account_identifier(purchaser, &SUB_ACCOUNT);
    let console_account_identifier = principal_to_account_identifier(&id(), &SUB_ACCOUNT);

    // User should have processed a payment from the mission control center
    let block_index = find_payment(
        purchaser_account_identifier,
        console_account_identifier,
        fee,
        purchaser_payment_block_index.clone(),
    )
    .await;

    if block_index.is_none() {
        return Err([
            "No valid payment found to create satellite.",
            &format!(" Purchaser: {purchaser_account_identifier}"),
            &format!(" Console: {console_account_identifier}"),
            &format!(" Amount: {fee}"),
            &format!(" Block index: {:?}", block_index),
        ]
        .join(""));
    }

    Ok(purchaser_payment_block_index.clone())
}

pub async fn refund_payment(
    purchaser: &Principal,
    canister_fee: Tokens,
) -> Result<BlockIndex, String> {
    // We refund the satellite creation fee minus the ic fee - i.e. user pays the fee
    let refund_amount = canister_fee - IC_TRANSACTION_FEE_ICP;

    // Refund on error
    let refund_block_index = transfer_payment(
        purchaser,
        &SUB_ACCOUNT,
        MEMO_SATELLITE_CREATE_REFUND,
        refund_amount,
        IC_TRANSACTION_FEE_ICP,
    )
    .await
    .map_err(|e| format!("failed to call ledger: {e:?}"))?
    .map_err(|e| format!("ledger transfer error {e:?}"))?;

    Ok(refund_block_index)
}

pub async fn transfer_from(
    purchaser: &Principal,
    canister_fee: &Tokens,
) -> Result<BlockIndex, String> {
    let purchaser_account: Account = Account::from(purchaser.clone());
    let console_account: Account = Account::from(id());

    let amount = Nat::from(canister_fee.e8s());
    let transaction_fee = Nat::from(IC_TRANSACTION_FEE_ICP.e8s());

    let args: TransferFromArgs = TransferFromArgs {
        amount,
        from: purchaser_account,
        to: console_account,
        created_at_time: None,
        fee: Some(transaction_fee),
        memo: None,
        spender_subaccount: None,
    };

    let ledger_id = Principal::from_text(ICP_LEDGER).unwrap();

    let result = icrc_transfer_token_from(ledger_id, args)
        .await
        .map_err(|e| format!("failed to call ICRC ledger: {e:?}"))?
        .map_err(|e| format!("ledger ICRC transfer from error {e:?}"))?;

    let block_index: u64 = u64::try_from(result.0).map_err(|_| "Block index too large for u64")?;

    Ok(block_index)
}
