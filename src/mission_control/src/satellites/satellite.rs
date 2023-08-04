use crate::satellites::store::add_satellite;
use crate::store::get_user;
use crate::types::state::Satellite;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_ledger_types::{BlockIndex, Tokens};
use shared::constants::{IC_TRANSACTION_FEE_ICP, MEMO_CANISTER_CREATE};
use shared::env::CONSOLE;
use shared::ledger::{transfer_payment, SUB_ACCOUNT};
use shared::types::interface::{CreateSegmentArgs, GetCreateSatelliteFeeArgs};
use shared::types::state::{SatelliteId, UserId};

pub async fn create_satellite(name: &str) -> Result<Satellite, String> {
    let console = Principal::from_text(CONSOLE).unwrap();
    let user: UserId = get_user();

    let args = GetCreateSatelliteFeeArgs { user };

    let satellite_fee: CallResult<(Option<Tokens>,)> =
        call(console, "get_create_satellite_fee", (args,)).await;

    match satellite_fee {
        Err((_, message)) => Err(["Cannot fetch satellite creation fee.", &message].join(" - ")),
        Ok((fee,)) => {
            match fee {
                // If no fee provided, the creation of the satellite is probably for free
                None => create_and_save_satellite(&user, name, None).await,
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

                    create_and_save_satellite(&user, name, Some(block_index)).await
                }
            }
        }
    }
}

async fn create_and_save_satellite(
    user: &UserId,
    name: &str,
    block_index: Option<BlockIndex>,
) -> Result<Satellite, String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = CreateSegmentArgs {
        user: *user,
        block_index,
    };

    let result: CallResult<(SatelliteId,)> = call(console, "create_satellite", (args,)).await;

    match result {
        Err((_, message)) => Err(["Create satellite failed.", &message].join(" - ")),
        Ok((satellite,)) => Ok(add_satellite(&satellite, name)),
    }
}
