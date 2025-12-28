use candid::{Nat, Principal};
use ic_ledger_types::{BlockIndex, Tokens};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;
use junobuild_shared::constants_shared::MEMO_CANISTER_CREATE;
use junobuild_shared::ic::api::id;
use junobuild_shared::ledger::convert_memo_to_icrc;
use junobuild_shared::ledger::icrc::icrc_transfer_token_from;

pub async fn icrc_transfer_from(
    purchaser: &Principal,
    ledger_id: &Principal,
    canister_fee: &Tokens,
    transaction_fee: &Nat,
) -> Result<BlockIndex, String> {
    let purchaser_account: Account = Account::from(*purchaser);
    let console_account: Account = Account::from(id());

    let amount = Nat::from(canister_fee.e8s());

    let args: TransferFromArgs = TransferFromArgs {
        amount,
        from: purchaser_account,
        to: console_account,
        created_at_time: None,
        fee: Some(transaction_fee.clone()),
        memo: Some(convert_memo_to_icrc(&MEMO_CANISTER_CREATE)),
        spender_subaccount: None,
    };

    let result = icrc_transfer_token_from(*ledger_id, args)
        .await
        .map_err(|e| format!("failed to call ICRC ledger: {e:?}"))?
        .map_err(|e| format!("ledger ICRC transfer from error {e:?}"))?;

    let block_index: u64 = u64::try_from(result.0).map_err(|_| "Block index too large for u64")?;

    Ok(block_index)
}
