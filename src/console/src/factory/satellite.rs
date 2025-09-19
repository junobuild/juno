use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::canister::create_canister;
use crate::factory::utils::controllers::remove_console_controller;
use crate::factory::utils::wasm::satellite_wasm_arg;
use crate::store::heap::{get_satellite_fee, increment_satellites_rate};
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_SATELLITE_CYCLES;
use junobuild_shared::mgmt::cmc::cmc_create_canister_install_code;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::{CreateSatelliteArgs, InitStorageArgs};
use junobuild_shared::types::state::{MissionControlId, UserId};

pub async fn create_satellite(
    console: Principal,
    caller: Principal,
    args: CreateSatelliteArgs,
) -> Result<Principal, String> {
    let storage = args.storage.clone();

    create_canister(
        move |console, mission_control_id, user, subnet_id| async move {
            create_satellite_wasm(console, mission_control_id, user, subnet_id, storage).await
        },
        &increment_satellites_rate,
        &get_satellite_fee,
        console,
        caller,
        args.into(),
    )
    .await
}

async fn create_satellite_wasm(
    console: Principal,
    mission_control_id: MissionControlId,
    user: UserId,
    subnet_id: Option<SubnetId>,
    storage: Option<InitStorageArgs>,
) -> Result<Principal, String> {
    let wasm_arg = satellite_wasm_arg(&user, &mission_control_id, storage)?;

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: Vec::from([console, mission_control_id, user]),
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_ONE_YEAR),
    };

    let result = if let Some(subnet_id) = subnet_id {
        cmc_create_canister_install_code(
            &create_settings_arg,
            &wasm_arg,
            CREATE_SATELLITE_CYCLES,
            &subnet_id,
        )
        .await
    } else {
        create_canister_install_code(&create_settings_arg, &wasm_arg, CREATE_SATELLITE_CYCLES).await
    };

    match result {
        Err(error) => Err(error),
        Ok(satellite_id) => {
            remove_console_controller(&satellite_id, &user, &mission_control_id).await?;
            Ok(satellite_id)
        }
    }
}
