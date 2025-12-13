use crate::ledger::types::icrc::{IcrcTransferFromResult, IcrcTransferResult};
use candid::Principal;
use ic_cdk::call::{Call, CallResult};
use icrc_ledger_types::icrc1::transfer::TransferArg;
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;

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
    Ok(Call::bounded_wait(ledger_id, "icrc1_transfer")
        .with_arg(args)
        .await?
        .candid::<IcrcTransferResult>()?)
}

/// Initiates a transfer from a specified account on a ledger using the provided ICRC-2 arguments.
///
/// This function performs a transfer using the `icrc2_transfer_from` method on the specified ledger
/// and returns the result of the transfer operation.
///
/// # Arguments
/// * `ledger_id` - A `Principal` representing the ID of the ledger where the transfer will be executed.
/// * `args` - A `TransferFromArgs` struct containing the details of the ICRC-2 transfer, including the source account.
///
/// # Returns
/// A `CallResult<IcrcTransferFromResult>` indicating either the success or failure of the ICRC-2 token transfer.
pub async fn icrc_transfer_token_from(
    ledger_id: Principal,
    args: TransferFromArgs,
) -> CallResult<IcrcTransferFromResult> {
    Ok(Call::bounded_wait(ledger_id, "icrc2_transfer_from")
        .with_arg(args)
        .await?
        .candid::<IcrcTransferFromResult>()?)
}
