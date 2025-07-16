use crate::guards::caller_is_user_or_admin_controller;
use candid::Principal;
use ic_cdk::trap;
use ic_cdk_macros::update;
use ic_ledger_types::{TransferArgs, TransferResult};
use icrc_ledger_types::icrc1::transfer::TransferArg;
use junobuild_shared::ledger::icp::transfer_token;
use junobuild_shared::ledger::icrc::icrc_transfer_token;
use junobuild_shared::ledger::types::icrc::IcrcTransferResult;

#[update(guard = "caller_is_user_or_admin_controller")]
async fn icp_transfer(args: TransferArgs) -> TransferResult {
    transfer_token(args)
        .await
        .map_err(|e| trap(&format!("Failed to call ledger: {:?}", e)))?
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn icrc_transfer(ledger_id: Principal, args: TransferArg) -> IcrcTransferResult {
    icrc_transfer_token(ledger_id, args)
        .await
        .map_err(|e| trap(&format!("Failed to call ICRC ledger: {:?}", e)))?
}
