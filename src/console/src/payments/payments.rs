use candid::Principal;
use ic_cdk::id;
use ic_ledger_types::{
    account_balance, AccountBalanceArgs, AccountIdentifier, BlockIndex, Memo, Tokens,
};
use junobuild_shared::constants::IC_TRANSACTION_FEE_ICP;
use junobuild_shared::env::LEDGER;
use junobuild_shared::ledger::{principal_to_account_identifier, transfer_token, SUB_ACCOUNT};

pub async fn withdraw_balance() -> Result<BlockIndex, String> {
    let account_identifier: AccountIdentifier = AccountIdentifier::from_hex(
        "e4aaed31b1cbf2dfaaca8ef9862a51b04fc4a314e2c054bae8f28d501c57068b",
    )?;

    let balance = console_balance().await?;

    let block_index = transfer_token(
        account_identifier,
        Memo(0),
        balance - IC_TRANSACTION_FEE_ICP,
        IC_TRANSACTION_FEE_ICP,
    )
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
