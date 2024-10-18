use crate::segments::canister::{create_canister, delete_canister};
use crate::segments::msg::ORBITER_NOT_FOUND;
use crate::segments::store::{add_orbiter, delete_orbiter as delete_orbiter_store, get_orbiter};
use crate::types::interface::CreateCanisterConfig;
use crate::types::state::Orbiter;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_ledger_types::BlockIndex;
use junobuild_shared::env::CONSOLE;
use junobuild_shared::types::interface::CreateCanisterArgs;
use junobuild_shared::types::state::{OrbiterId, OrbiterSatelliteConfig, SatelliteId, UserId};
use std::collections::HashMap;

pub async fn create_orbiter(name: &Option<String>) -> Result<Orbiter, String> {
    let config: CreateCanisterConfig = CreateCanisterConfig {
        name: name.clone(),
        subnet_id: None,
    };

    create_canister("get_create_orbiter_fee", create_and_save_orbiter, &config).await
}

pub async fn create_orbiter_with_config(config: &CreateCanisterConfig) -> Result<Orbiter, String> {
    create_canister("get_create_orbiter_fee", create_and_save_orbiter, config).await
}

pub async fn attach_orbiter(
    orbiter_id: &OrbiterId,
    name: &Option<String>,
) -> Result<Orbiter, String> {
    let orbiter = get_orbiter(orbiter_id);

    match orbiter {
        Some(_) => Err("Orbiter already added to mission control.".to_string()),
        None => {
            assert_orbiter(orbiter_id).await?;

            let orbiter = add_orbiter(orbiter_id, name);

            Ok(orbiter)
        }
    }
}

pub async fn detach_orbiter(orbiter_id: &OrbiterId) -> Result<(), String> {
    let orbiter = get_orbiter(orbiter_id);

    match orbiter {
        None => Err(ORBITER_NOT_FOUND.to_string()),
        Some(_orbiter) => {
            delete_orbiter_store(orbiter_id);

            Ok(())
        }
    }
}

pub async fn delete_orbiter(orbiter_id: &OrbiterId, cycles_to_deposit: u128) -> Result<(), String> {
    let orbiter = get_orbiter(orbiter_id);

    match orbiter {
        None => Err(ORBITER_NOT_FOUND.to_string()),
        Some(_) => {
            delete_canister(orbiter_id, cycles_to_deposit).await?;

            delete_orbiter_store(orbiter_id);

            Ok(())
        }
    }
}

async fn create_and_save_orbiter(
    user: UserId,
    CreateCanisterConfig { name, subnet_id }: CreateCanisterConfig,
    block_index: Option<BlockIndex>,
) -> Result<Orbiter, String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = CreateCanisterArgs {
        user,
        block_index,
        subnet_id,
    };

    let result: CallResult<(OrbiterId,)> = call(console, "create_orbiter", (args,)).await;

    match result {
        Err((_, message)) => Err(["Create orbiter failed.", &message].join(" - ")),
        Ok((orbiter,)) => Ok(add_orbiter(&orbiter, &name)),
    }
}

async fn assert_orbiter(orbiter_id: &OrbiterId) -> Result<(), String> {
    // We query list_satellite_configs that way we assert:
    // 1. This mission control is a controller of the Orbiter
    // 2. The targeted canister exposes the particular function which probably means it's an Orbiter
    //
    // Note: We could have use list_controllers() but the Satellite also exposes that function.
    type SatelliteConfigs = HashMap<SatelliteId, OrbiterSatelliteConfig>;

    let result: CallResult<(SatelliteConfigs,)> =
        call(*orbiter_id, "list_satellite_configs", ((),)).await;

    match result {
        Err((_, message)) => Err(["Set orbiter failed.", &message].join(" - ")),
        Ok((_,)) => Ok(()),
    }
}
