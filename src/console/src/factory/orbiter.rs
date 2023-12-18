use crate::controllers::remove_console_controller;
use crate::factory::canister::create_canister;
use crate::store::{get_orbiter_fee, increment_orbiters_rate};
use crate::wasm::orbiter_wasm_arg;
use candid::Principal;
use shared::constants::CREATE_ORBITER_CYCLES;
use shared::ic::create_canister_install_code;
use shared::types::interface::CreateCanisterArgs;
use shared::types::state::{MissionControlId, UserId};

pub async fn create_orbiter(
    console: Principal,
    caller: Principal,
    args: CreateCanisterArgs,
) -> Result<Principal, String> {
    create_canister(
        create_orbiter_wasm,
        &increment_orbiters_rate,
        &get_orbiter_fee,
        console,
        caller,
        args,
    )
    .await
}

async fn create_orbiter_wasm(
    console: Principal,
    mission_control_id: MissionControlId,
    user: UserId,
) -> Result<Principal, String> {
    let wasm_arg = orbiter_wasm_arg(&user, &mission_control_id);
    let result = create_canister_install_code(
        Vec::from([console, mission_control_id, user]),
        &wasm_arg,
        CREATE_ORBITER_CYCLES,
    )
    .await;

    match result {
        Err(error) => Err(error),
        Ok(orbiter_id) => {
            remove_console_controller(&orbiter_id, &user, &mission_control_id).await?;
            Ok(orbiter_id)
        }
    }
}
