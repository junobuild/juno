use crate::store::get_user;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_ledger_types::{BlockIndex, Tokens};
use shared::constants::{IC_TRANSACTION_FEE_ICP, MEMO_CANISTER_CREATE};
use shared::env::CONSOLE;
use shared::ledger::{transfer_payment, SUB_ACCOUNT};
use shared::types::interface::GetCreateCanisterFeeArgs;
use shared::types::state::UserId;
use std::future::Future;

pub async fn create_canister<F, Fut, T>(
    fee_method: &str,
    create_and_save: F,
    name: &Option<String>,
) -> Result<T, String>
where
    F: FnOnce(UserId, Option<String>, Option<BlockIndex>) -> Fut,
    Fut: Future<Output = Result<T, String>>,
{
    let console = Principal::from_text(CONSOLE).unwrap();
    let user: UserId = get_user();

    let args = GetCreateCanisterFeeArgs { user };

    let fee: CallResult<(Option<Tokens>,)> = call(console, fee_method, (args,)).await;

    match fee {
        Err((_, message)) => Err(["Cannot fetch creation fee.", &message].join(" - ")),
        Ok((fee,)) => {
            match fee {
                // If no fee provided, the creation of the satellite is probably for free
                None => create_and_save(user, name.clone(), None).await,
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
                    .map_err(|e| format!("failed to call ledger: {:?}", e))?
                    .map_err(|e| format!("ledger transfer error {:?}", e))?;

                    create_and_save(user, name.clone(), Some(block_index)).await
                }
            }
        }
    }
}
