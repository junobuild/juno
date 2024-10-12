use crate::ledger::types::icrc::IcrcTransferResult;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use icrc_ledger_types::icrc1::transfer::TransferArg;

/// Initiates a transfer of tokens on a specified ledger using the provided ICRC-1 arguments.
///
/// This function performs a transfer using the `icrc1_transfer` method on the specified ledger
/// and returns the result of the transfer operation.
///
/// # Arguments
/// * `ledger_id` - A `Principal` representing the ID of the ledger where the transfer will be executed.
/// * `args` - A `TransferArg` struct containing the details of the ICRC-1 transfer.
///
/// # Returns
/// A `CallResult<IcrcTransferResult>` indicating either the success or failure of the ICRC-1 token transfer.
pub async fn icrc_transfer_token(
    ledger_id: Principal,
    args: TransferArg,
) -> CallResult<IcrcTransferResult> {
    let (result,) = call(ledger_id, "icrc1_transfer", (args,)).await?;
    Ok(result)
}
