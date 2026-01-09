use crate::cycles::services::ledger::types::TransferFromToConsole;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::BlockIndex;
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;
use junobuild_shared::ic::api::id;
use junobuild_shared::ledger::icrc::icrc_transfer_token_from;

pub async fn icrc_transfer_from(
    TransferFromToConsole {
        ledger_id,
        from,
        amount,
        transaction_fee,
    }: &TransferFromToConsole,
) -> Result<BlockIndex, String> {
    let console_account: Account = Account::from(id());

    let args: TransferFromArgs = TransferFromArgs {
        from: *from,
        to: console_account,
        amount: amount.clone(),
        fee: Some(transaction_fee.clone()),
        created_at_time: None,
        memo: None,
        spender_subaccount: None,
    };

    icrc_transfer_token_from(*ledger_id, args)
        .await
        .map_err(|e| format!("failed to call ICRC ledger: {e:?}"))?
        .map_err(|e| format!("ledger ICRC transfer from error {e:?}"))
}
