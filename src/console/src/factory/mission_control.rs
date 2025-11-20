use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::utils::controllers::update_mission_control_controllers;
use crate::factory::utils::wasm::mission_control_wasm_arg;
use crate::store::heap::increment_mission_controls_rate;
use crate::store::stable::{
    add_mission_control, delete_mission_control, get_mission_control, init_empty_mission_control,
};
use crate::types::state::{MissionControl, Provider};
use candid::Nat;
use junobuild_shared::constants_shared::CREATE_MISSION_CONTROL_CYCLES;
use junobuild_shared::ic::api::{caller, id};
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::state::UserId;

pub async fn init_user_mission_control_with_caller() -> Result<MissionControl, String> {
    let caller = caller();

    let mission_control = get_mission_control(&caller)?;

    match mission_control {
        Some(mission_control) => Ok(mission_control),
        None => {
            // Guard too many requests
            increment_mission_controls_rate()?;

            init_empty_mission_control(&caller, &None);

            create_mission_control(&caller).await
        }
    }
}

pub async fn init_user_mission_control_with_provider(
    user: &UserId,
    provider: &Provider,
) -> Result<MissionControl, String> {
    init_empty_mission_control(user, &Some(provider.clone()));

    create_mission_control(user).await
}

async fn create_mission_control(user_id: &UserId) -> Result<MissionControl, String> {
    let wasm_arg = mission_control_wasm_arg(user_id)?;

    let console = id();

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: Vec::from([console, *user_id]),
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_ONE_YEAR),
    };

    let create = create_canister_install_code(
        &create_settings_arg,
        &wasm_arg,
        CREATE_MISSION_CONTROL_CYCLES,
    )
    .await;

    match create {
        Err(e) => {
            // We delete the pending empty mission control center from the list - e.g. this can happens if manager is out of cycles and user would be blocked
            delete_mission_control(user_id);
            Err(["Canister cannot be initialized.", &e].join(""))
        }
        Ok(mission_control_id) => {
            // There error is unlikely to happen as the implementation ensures a mission control
            // metadata was created before calling this factory function.
            let mission_control = add_mission_control(user_id, &mission_control_id)?;

            update_mission_control_controllers(&mission_control_id, user_id).await?;

            Ok(mission_control)
        }
    }
}
