use crate::accounts::{get_existing_account, update_mission_control};
use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::canister::create_canister_with_account;
use crate::factory::types::CanisterCreator;
use crate::factory::utils::controllers::update_mission_control_controllers;
use crate::factory::utils::wasm::mission_control_wasm_arg;
use crate::store::heap::{get_mission_control_fee, increment_mission_controls_rate};
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_MISSION_CONTROL_CYCLES;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::cmc::cmc_create_canister_install_code;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::CreateMissionControlArgs;

// TODO: rename to mission_control

pub async fn create_mission_control(
    caller: Principal,
    args: CreateMissionControlArgs,
) -> Result<Principal, String> {
    let account = get_existing_account(&caller)?;

    if account.mission_control_id.is_some() {
        return Err("Mission control center already exist.".to_string());
    }

    let creator: CanisterCreator = CanisterCreator::User(account.owner);

    let mission_control_id = create_canister_with_account(
        create_mission_control_wasm,
        &increment_mission_controls_rate,
        &get_mission_control_fee,
        &account,
        creator,
        args.into(),
    )
    .await?;

    update_mission_control(&account.owner, &mission_control_id)?;

    Ok(mission_control_id)
}

async fn create_mission_control_wasm(
    creator: CanisterCreator,
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String> {
    let CanisterCreator::User(user_id) = creator else {
        return Err("Mission Control cannot create another Mission Control".to_string());
    };

    let wasm_arg = mission_control_wasm_arg(&user_id)?;

    // We temporarily use the Console as a controller to create the canister but
    // remove it as soon as it is spin.
    let temporary_init_controllers = Vec::from([id(), user_id.clone()]);

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: temporary_init_controllers,
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_ONE_YEAR),
    };

    let mission_control_id = if let Some(subnet_id) = subnet_id {
        cmc_create_canister_install_code(
            &create_settings_arg,
            &wasm_arg,
            CREATE_MISSION_CONTROL_CYCLES,
            &subnet_id,
        )
        .await
    } else {
        create_canister_install_code(
            &create_settings_arg,
            &wasm_arg,
            CREATE_MISSION_CONTROL_CYCLES,
        )
        .await
    }?;

    update_mission_control_controllers(&mission_control_id, &user_id).await?;

    Ok(mission_control_id)
}
