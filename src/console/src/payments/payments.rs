use candid::Principal;
use ic_cdk::id;
use ic_ledger_types::{
    account_balance, AccountBalanceArgs, AccountIdentifier, BlockIndex, Memo, Tokens, TransferArgs,
};
use junobuild_shared::constants::IC_TRANSACTION_FEE_ICP;
use junobuild_shared::env::LEDGER;
use junobuild_shared::ledger::icp::{principal_to_account_identifier, transfer_token, SUB_ACCOUNT};

/// Withdraws the entire balance of the Console — i.e., withdraws the payments for the additional
/// Satellites and Orbiters that have been made.
///
/// The destination account for the withdrawal is one of mine (David here).
///
/// # Returns
/// - `Ok(BlockIndex)`: If the transfer was successful, it returns the block index of the transaction.
/// - `Err(String)`: If an error occurs during the process, it returns a descriptive error message.
///
/// # Errors
/// This function can return errors in the following cases:
/// - If the account balance retrieval fails.
/// - If the transfer to the ledger fails due to insufficient balance or other issues.
///
/// # Example
/// ```rust
/// let result = withdraw_balance().await;
/// match result {
///     Ok(block_index) => println!("Withdrawal successful! Block index: {}", block_index),
///     Err(e) => println!("Error during withdrawal: {}", e),
/// }
/// ```
pub async fn withdraw_balance() -> Result<BlockIndex, String> {
    let account_identifier: AccountIdentifier = AccountIdentifier::from_hex(
        "e4aaed31b1cbf2dfaaca8ef9862a51b04fc4a314e2c054bae8f28d501c57068b",
    )?;

    let balance = console_balance().await?;

    let args = TransferArgs {
        memo: Memo(0),
        amount: balance - IC_TRANSACTION_FEE_ICP,
        fee: IC_TRANSACTION_FEE_ICP,
        from_subaccount: Some(SUB_ACCOUNT),
        to: account_identifier,
        created_at_time: None,
    };

    let block_index = transfer_token(args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e| format!("ledger transfer error {:?}", e))?;

    Ok(block_index)
}

async fn console_balance() -> Result<Tokens, String> {
    let ledger = Principal::from_text(LEDGER).unwrap();

    let console_account_identifier: AccountIdentifier =
        principal_to_account_identifier(&id(), &SUB_ACCOUNT);

    let args: AccountBalanceArgs = AccountBalanceArgs {
        account: console_account_identifier,
    };

    let tokens = account_balance(ledger, args)
        .await
        .map_err(|e| format!("failed to call ledger balance: {:?}", e))?;

    Ok(tokens)
}
