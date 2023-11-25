use crate::segments::canister::{create_canister, delete_canister};
use crate::segments::store::{add_orbiter, delete_orbiter as delete_orbiter_store, get_orbiter};
use crate::types::state::Orbiter;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, id};
use ic_ledger_types::BlockIndex;
use shared::controllers::is_controller;
use shared::env::CONSOLE;
use shared::types::interface::CreateCanisterArgs;
use shared::types::state::{Controllers, OrbiterId, UserId};

pub async fn create_orbiter(name: &Option<String>) -> Result<Orbiter, String> {
    create_canister("get_create_orbiter_fee", create_and_save_orbiter, name).await
}

pub async fn attach_orbiter(
    orbiter_id: &OrbiterId,
    name: &Option<String>,
) -> Result<Orbiter, String> {
    let orbiter = get_orbiter(orbiter_id);

    match orbiter {
        Some(_) => Err("Orbiter already added to mission control.".to_string()),
        None => {
            assert_controller(orbiter_id).await?;

            let orbiter = add_orbiter(orbiter_id, name);

            Ok(orbiter)
        }
    }
}

pub async fn delete_orbiter(orbiter_id: &OrbiterId, cycles_to_deposit: u128) -> Result<(), String> {
    let orbiter = get_orbiter(orbiter_id);

    match orbiter {
        None => Err("Orbiter not found or not owned by this mission control.".to_string()),
        Some(_) => {
            delete_canister(orbiter_id, cycles_to_deposit).await?;

            delete_orbiter_store(orbiter_id);

            Ok(())
        }
    }
}

async fn create_and_save_orbiter(
    user: UserId,
    name: Option<String>,
    block_index: Option<BlockIndex>,
) -> Result<Orbiter, String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = CreateCanisterArgs { user, block_index };

    let result: CallResult<(OrbiterId,)> = call(console, "create_orbiter", (args,)).await;

    match result {
        Err((_, message)) => Err(["Create orbiter failed.", &message].join(" - ")),
        Ok((orbiter,)) => Ok(add_orbiter(&orbiter, &name)),
    }
}

async fn assert_controller(orbiter_id: &OrbiterId) -> Result<(), String> {
    let result: CallResult<(Controllers,)> =
        call(orbiter_id.clone(), "list_controllers", ((),)).await;

    match result {
        Err((_, message)) => Err(["Add orbiter failed.", &message].join(" - ")),
        Ok((controllers,)) => {
            let mission_control_id = id();

            match is_controller(mission_control_id, &controllers) {
                false => Err("Mission control is not a controller of the orbiter".to_string()),
                true => Ok(()),
            }
        }
    }
}
