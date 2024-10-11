use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use icrc_ledger_types::icrc1::transfer::{TransferArg};
use crate::env::LEDGER;
use crate::ledger::types::icrc::IcrcTransferResult;

/// Initiates a transfer of tokens on the ICP ledger using the provided ICRC-1 arguments.
///
/// This function performs a transfer using the `icrc1_transfer` method on the ICP ledger
/// and returns the result of the transfer operation.
///
/// # Arguments
/// * `args` - A `TransferArg` struct containing the details of the ICRC-1 transfer.
///
/// # Returns
/// A `CallResult<IcrcTransferResult>` indicating either the success or failure of the ICRC-1 token transfer.
pub async fn icrc_transfer(args: TransferArg) -> CallResult<IcrcTransferResult> {
    let ledger = Principal::from_text(LEDGER).unwrap();

    let (result,) = call(ledger, "icrc1_transfer", (args,)).await?;
    Ok(result)
}