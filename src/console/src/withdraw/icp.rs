use crate::types::interface::{WithdrawArgs, WithdrawResult};
use candid::Principal;
use ic_ledger_types::{
    account_balance, AccountBalanceArgs, AccountIdentifier, Memo, Tokens, TransferArgs,
};
use junobuild_shared::constants::shared::IC_TRANSACTION_FEE_ICP;
use junobuild_shared::env::ICP_LEDGER;
use junobuild_shared::ic::api::id;
use junobuild_shared::ledger::icp::{principal_to_account_identifier, transfer_token, SUB_ACCOUNT};

/// Withdraws the overall ICP balance of the Console — i.e. withdraws the payments that have been made.
///
/// The destination account for the withdrawal is one passed by the administrator.
pub async fn withdraw_icp_balance(
    WithdrawArgs { to }: &WithdrawArgs,
) -> Result<WithdrawResult, String> {
    let account_identifier = principal_to_account_identifier(to, &SUB_ACCOUNT);

    let balance = console_balance().await?;

    let amount = balance - IC_TRANSACTION_FEE_ICP;

    let args = TransferArgs {
        memo: Memo(0),
        amount,
        fee: IC_TRANSACTION_FEE_ICP,
        from_subaccount: Some(SUB_ACCOUNT),
        to: account_identifier,
        created_at_time: None,
    };

    let block_index = transfer_token(args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e| format!("ledger transfer error {:?}", e))?;

    let result: WithdrawResult = WithdrawResult {
        block_index,
        amount: amount.e8s(),
    };

    Ok(result)
}

async fn console_balance() -> Result<Tokens, String> {
    let ledger_id = Principal::from_text(ICP_LEDGER).unwrap();

    let console_account_identifier: AccountIdentifier =
        principal_to_account_identifier(&id(), &SUB_ACCOUNT);

    let args: AccountBalanceArgs = AccountBalanceArgs {
        account: console_account_identifier,
    };

    let tokens = account_balance(ledger_id, &args)
        .await
        .map_err(|e| format!("failed to call ledger balance: {:?}", e))?;

    Ok(tokens)
}
