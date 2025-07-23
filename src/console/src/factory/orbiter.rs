use crate::constants::FREEZING_THRESHOLD_THREE_MONTHS;
use crate::controllers::remove_console_controller;
use crate::factory::canister::create_canister;
use crate::store::heap::{get_orbiter_fee, increment_orbiters_rate};
use crate::wasm::orbiter_wasm_arg;
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_ORBITER_CYCLES;
use junobuild_shared::mgmt::cmc::cmc_create_canister_install_code;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::CreateCanisterArgs;
use junobuild_shared::types::state::{MissionControlId, UserId};

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
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String> {
    let wasm_arg = orbiter_wasm_arg(&user, &mission_control_id)?;

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: Vec::from([console, mission_control_id, user]),
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_THREE_MONTHS),
    };

    let result = if let Some(subnet_id) = subnet_id {
        cmc_create_canister_install_code(
            &create_settings_arg,
            &wasm_arg,
            CREATE_ORBITER_CYCLES,
            &subnet_id,
        )
        .await
    } else {
        create_canister_install_code(&create_settings_arg, &wasm_arg, CREATE_ORBITER_CYCLES).await
    };

    match result {
        Err(error) => Err(error),
        Ok(orbiter_id) => {
            remove_console_controller(&orbiter_id, &user, &mission_control_id).await?;
            Ok(orbiter_id)
        }
    }
}
