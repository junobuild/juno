use crate::segments::canister::{create_canister, delete_canister};
use crate::segments::store::{
    add_satellite, delete_satellite as delete_satellite_store, get_satellite,
};
use crate::types::state::Satellite;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_ledger_types::BlockIndex;
use shared::env::CONSOLE;
use shared::types::interface::CreateCanisterArgs;
use shared::types::state::{SatelliteId, UserId};

pub async fn create_satellite(name: &str) -> Result<Satellite, String> {
    create_canister(
        "get_create_satellite_fee",
        create_and_save_satellite,
        &Some(name.to_string().clone()),
    )
    .await
}

pub async fn delete_satellite(
    satellite_id: &SatelliteId,
    cycles_to_deposit: u128,
) -> Result<(), String> {
    let satellite = get_satellite(satellite_id);

    match satellite {
        None => Err("Satellite not found or not owned by this mission control.".to_string()),
        Some(_) => {
            delete_canister(satellite_id, cycles_to_deposit).await?;

            delete_satellite_store(satellite_id);

            Ok(())
        }
    }
}

async fn create_and_save_satellite(
    user: UserId,
    name: Option<String>,
    block_index: Option<BlockIndex>,
) -> Result<Satellite, String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = CreateCanisterArgs { user, block_index };

    let result: CallResult<(SatelliteId,)> = call(console, "create_satellite", (args,)).await;

    match result {
        Err((_, message)) => Err(["Create satellite failed.", &message].join(" - ")),
        Ok((satellite,)) => Ok(add_satellite(&satellite, &name)),
    }
}
