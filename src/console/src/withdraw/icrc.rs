use crate::types::interface::WithdrawArgs;
use candid::{Nat, Principal};
use ic_cdk::call::Call;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferArg};
use junobuild_shared::constants::shared::IC_TRANSACTION_FEE_CYCLES;
use junobuild_shared::env::CYCLES_LEDGER;
use junobuild_shared::ic::api::id;
use junobuild_shared::ic::DecodeCandid;
use junobuild_shared::ledger::icrc::icrc_transfer_token;
use junobuild_shared::ledger::types::cycles::CyclesTokens;

/// Withdraws the overall balance of the Console on the Cycles ledger — i.e. withdraws the payments that have been made.
///
/// The destination account for the withdrawal is one passed by the administrator.
pub async fn withdraw_icrc_balance(
    WithdrawArgs { to }: &WithdrawArgs,
) -> Result<BlockIndex, String> {
    let account: Account = Account::from(*to);

    let balance = console_balance().await?;

    let balance_without_fee = balance - IC_TRANSACTION_FEE_CYCLES;
    let amount = Nat::from(balance_without_fee.e12s());

    let transaction_fee = Nat::from(IC_TRANSACTION_FEE_CYCLES.e12s());

    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    let args: TransferArg = TransferArg {
        to: account,
        amount,
        fee: Some(transaction_fee),
        created_at_time: None,
        from_subaccount: None,
        memo: None,
    };

    let block_index = icrc_transfer_token(ledger_id, args)
        .await
        .map_err(|e| format!("failed to call ICRC ledger: {e:?}"))?
        .map_err(|e| format!("ICRC ledger transfer error {e:?}"))?;

    Ok(block_index)
}

async fn console_balance() -> Result<CyclesTokens, String> {
    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    let args: Account = Account::from(id());

    let tokens = Call::bounded_wait(ledger_id, "icrc1_balance_of")
        .with_arg(args)
        .await
        .decode_candid::<Nat>()?;

    let e12s = u64::try_from(tokens.0).map_err(|_| "Balance exceeds u64 range".to_string())?;

    Ok(CyclesTokens::from_e12s(e12s))
}
