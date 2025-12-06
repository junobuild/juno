use candid::Principal;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::constants_shared::{IC_TRANSACTION_FEE_ICP, MEMO_SATELLITE_CREATE_REFUND};
use junobuild_shared::ic::api::id;
use junobuild_shared::ledger::icp::{
    find_payment, principal_to_account_identifier, transfer_payment, SUB_ACCOUNT,
};

pub async fn verify_payment(
    purchaser: &Principal,
    purchaser_payment_block_index: &BlockIndex,
    canister_fee: Tokens,
) -> Result<BlockIndex, String> {
    let purchaser_account_identifier = principal_to_account_identifier(purchaser, &SUB_ACCOUNT);
    let console_account_identifier = principal_to_account_identifier(&id(), &SUB_ACCOUNT);

    // User should have processed a payment from the mission control center
    let block_index = find_payment(
        purchaser_account_identifier,
        console_account_identifier,
        canister_fee,
        purchaser_payment_block_index.clone(),
    )
    .await;

    if block_index.is_none() {
        return Err([
            "No valid payment found to create satellite.",
            &format!(" Purchaser: {purchaser_account_identifier}"),
            &format!(" Console: {console_account_identifier}"),
            &format!(" Amount: {canister_fee}"),
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
