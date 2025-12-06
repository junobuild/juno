use candid::Principal;
use ic_cdk::trap;
use ic_ledger_types::{BlockIndex, Tokens};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;
use junobuild_shared::env::LEDGER;
use junobuild_shared::ic::api::id;
use junobuild_shared::ledger::icp::{find_payment, principal_to_account_identifier, SUB_ACCOUNT};
use junobuild_shared::ledger::icrc::{icrc_transfer_token_from};

pub async fn verify_payment(purchaser: &Principal, purchaser_payment_block_index: &BlockIndex, fee: Tokens,) -> Result<BlockIndex, String> {
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
            .join(""))
    }

    Ok(purchaser_payment_block_index.clone())
}

pub async fn icrc_transfer_from(
    purchaser: &Principal,
    fee: Tokens,
) -> Result<BlockIndex, String> {
    let purchaser_account: Account = Account::from(purchaser);
    let console_account: Account = Account::from(id());

    let args: TransferFromArgs = TransferFromArgs {
        amount: amount.clone(),
        from: purchaser_account,
        to: console_account,
        created_at_time: None,
        fee: fee.clone(),
        memo: None,
        spender_subaccount: None,
    };

    let ledger_id = Principal::from_text(LEDGER).unwrap();

    icrc_transfer_token_from(ledger_id, args)
        .await
        .map_err(|e| trap(format!("Failed to transfer from the ICRC ledger: {e:?}")))
}