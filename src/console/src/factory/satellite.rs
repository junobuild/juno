use crate::controllers::remove_console_controller;
use crate::factory::canister::create_canister;
use crate::store::heap::{get_satellite_fee, increment_satellites_rate};
use crate::wasm::satellite_wasm_arg;
use candid::Principal;
use junobuild_shared::constants_shared::CREATE_SATELLITE_CYCLES;
use junobuild_shared::mgmt::cmc::cmc_create_canister_install_code;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::interface::CreateCanisterArgs;
use junobuild_shared::types::state::{MissionControlId, UserId};

pub async fn create_satellite(
    console: Principal,
    caller: Principal,
    args: CreateCanisterArgs,
) -> Result<Principal, String> {
    create_canister(
        create_satellite_wasm,
        &increment_satellites_rate,
        &get_satellite_fee,
        console,
        caller,
        args,
    )
    .await
}

async fn create_satellite_wasm(
    console: Principal,
    mission_control_id: MissionControlId,
    user: UserId,
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String> {
    let wasm_arg = satellite_wasm_arg(&user, &mission_control_id)?;

    let controller = Vec::from([console, mission_control_id, user]);

    let result = if let Some(subnet_id) = subnet_id {
        cmc_create_canister_install_code(controller, &wasm_arg, CREATE_SATELLITE_CYCLES, &subnet_id)
            .await
    } else {
        create_canister_install_code(controller, &wasm_arg, CREATE_SATELLITE_CYCLES).await
    };

    match result {
        Err(error) => Err(error),
        Ok(satellite_id) => {
            remove_console_controller(&satellite_id, &user, &mission_control_id).await?;
            Ok(satellite_id)
        }
    }
}
