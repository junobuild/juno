use crate::types::interface::CreateCanisterConfig;
use crate::user::store::get_user;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_cdk::call::Call;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::constants_shared::{IC_TRANSACTION_FEE_ICP, MEMO_CANISTER_CREATE};
use junobuild_shared::env::CONSOLE;
use junobuild_shared::ic::api::id;
use junobuild_shared::ic::DecodeCandid;
use junobuild_shared::ledger::icp::{transfer_payment, SUB_ACCOUNT};
use junobuild_shared::mgmt::ic::{delete_segment, stop_segment};
use junobuild_shared::types::interface::{DepositCyclesArgs, GetCreateCanisterFeeArgs};
use junobuild_shared::types::state::{UserId};
use std::future::Future;

pub async fn create_canister<F, Fut, T>(
    fee_method: &str,
    create_and_save: F,
    config: &CreateCanisterConfig,
) -> Result<T, String>
where
    F: FnOnce(UserId, CreateCanisterConfig, Option<BlockIndex>) -> Fut,
    Fut: Future<Output = Result<T, String>>,
{
    let console = Principal::from_text(CONSOLE).unwrap();
    let user: UserId = get_user();

    let args = GetCreateCanisterFeeArgs { user };

    let fee = Call::bounded_wait(console, fee_method)
        .with_arg(args)
        .await
        .decode_candid::<Option<Tokens>>()?;

    match fee {
        // If no fee provided, the creation of the satellite is probably for free
        None => create_and_save(user, config.clone(), None).await,
        Some(fee) => {
            // If a free is set, transfer the requested fee to the console
            let block_index = transfer_payment(
                &console,
                &SUB_ACCOUNT,
                MEMO_CANISTER_CREATE,
                fee,
                IC_TRANSACTION_FEE_ICP,
            )
            .await
            .map_err(|e| format!("failed to call ledger: {e:?}"))?
            .map_err(|e| format!("ledger transfer error {e:?}"))?;

            create_and_save(user, config.clone(), Some(block_index)).await
        }
    }
}

pub async fn delete_canister(segment_id: &Principal, cycles: u128) -> Result<(), String> {
    deposit_cycles(segment_id, cycles).await?;

    stop_segment(*segment_id).await?;

    delete_segment(*segment_id).await
}

async fn deposit_cycles(segment_id: &Principal, cycles: u128) -> Result<(), String> {
    let args = DepositCyclesArgs {
        destination_id: id(),
        cycles,
    };

    ic_cdk::print("Depositing cycles");

    let _ = Call::unbounded_wait(*segment_id, "deposit_cycles")
        .with_arg(args)
        .await
        .decode_candid::<()>()?;

    Ok(())
}
