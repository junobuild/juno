use crate::mgmt::monitoring::register_monitoring;
use crate::segments::canister::{create_canister, delete_canister};
use crate::segments::msg::SATELLITE_NOT_FOUND;
use crate::segments::store::{
    add_satellite, delete_satellite as delete_satellite_store, get_satellite,
};
use crate::types::interface::CreateCanisterConfig;
use crate::types::state::Satellite;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_ledger_types::BlockIndex;
use junobuild_shared::env::CONSOLE;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::interface::CreateCanisterArgs;
use junobuild_shared::types::state::{SatelliteId, UserId};

pub async fn create_satellite(name: &str) -> Result<Satellite, String> {
    let config: CreateCanisterConfig = CreateCanisterConfig {
        name: Some(name.to_string()),
        subnet_id: None,
    };

    create_canister(
        "get_create_satellite_fee",
        create_and_save_satellite,
        &config,
    )
    .await
}

pub async fn create_satellite_with_config(
    config: &CreateCanisterConfig,
) -> Result<Satellite, String> {
    create_canister(
        "get_create_satellite_fee",
        create_and_save_satellite,
        config,
    )
    .await
}

pub async fn delete_satellite(
    satellite_id: &SatelliteId,
    cycles_to_deposit: u128,
) -> Result<(), String> {
    let satellite = get_satellite(satellite_id);

    match satellite {
        None => Err(SATELLITE_NOT_FOUND.to_string()),
        Some(_) => {
            delete_canister(satellite_id, cycles_to_deposit).await?;

            delete_satellite_store(satellite_id);

            Ok(())
        }
    }
}

async fn create_and_save_satellite(
    user: UserId,
    CreateCanisterConfig { name, subnet_id }: CreateCanisterConfig,
    block_index: Option<BlockIndex>,
) -> Result<Satellite, String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = CreateCanisterArgs {
        user,
        block_index,
        subnet_id,
    };

    let result: CallResult<(SatelliteId,)> = call(console, "create_satellite", (args,)).await;

    match result {
        Err((_, message)) => Err(["Create satellite failed.", &message].join(" - ")),
        Ok((satellite_id,)) => {
            let satellite = add_satellite(&satellite_id, &name);

            register_monitoring(&satellite_id);

            Ok(satellite)
        }
    }
}

pub async fn attach_satellite(
    satellite_id: &SatelliteId,
    name: &Option<String>,
) -> Result<Satellite, String> {
    let satellite = get_satellite(satellite_id);

    match satellite {
        Some(_) => Err("Satellite already added to mission control.".to_string()),
        None => {
            assert_satellite(satellite_id).await?;

            let satellite = add_satellite(satellite_id, name);

            register_monitoring(satellite_id);

            Ok(satellite)
        }
    }
}

pub async fn detach_satellite(satellite_id: &SatelliteId) -> Result<(), String> {
    let satellite = get_satellite(satellite_id);

    match satellite {
        None => Err(SATELLITE_NOT_FOUND.to_string()),
        Some(_satellite) => {
            delete_satellite_store(satellite_id);

            Ok(())
        }
    }
}

async fn assert_satellite(satellite_id: &SatelliteId) -> Result<(), String> {
    // We query list_custom_domains that way we assert:
    // 1. This mission control is a controller of the Satellite
    // 2. The targeted canister exposes the particular function which probably means it's an Satellite
    //
    // Notes: We could have use list_controllers() but the Orbiter also exposes that function.
    // Likewise, we could have use list_rules but, list_custom_domains might return a smaller response
    let result: CallResult<(CustomDomains,)> =
        call(*satellite_id, "list_custom_domains", ((),)).await;

    match result {
        Err((_, message)) => Err(["Set satellite failed.", &message].join(" - ")),
        Ok((_,)) => Ok(()),
    }
}
