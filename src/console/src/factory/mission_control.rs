use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::controllers::update_mission_control_controllers;
use crate::store::heap::increment_mission_controls_rate;
use crate::store::{
    add_mission_control, delete_mission_control, get_mission_control, init_empty_mission_control,
};
use crate::types::state::MissionControl;
use crate::wasm::mission_control_wasm_arg;
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_MISSION_CONTROL_CYCLES;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::state::UserId;

pub async fn init_user_mission_control(
    console: &Principal,
    caller: &Principal,
) -> Result<MissionControl, String> {
    let result = get_mission_control(caller);
    match result {
        Err(error) => Err(error.to_string()),
        Ok(mission_control) => match mission_control {
            Some(mission_control) => Ok(mission_control),
            None => {
                // Guard too many requests
                increment_mission_controls_rate()?;

                create_mission_control(caller, console).await
            }
        },
    }
}

async fn create_mission_control(
    user: &UserId,
    console: &Principal,
) -> Result<MissionControl, String> {
    init_empty_mission_control(user);

    let wasm_arg = mission_control_wasm_arg(user)?;

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: Vec::from([*console, *user]),
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
            delete_mission_control(user);
            Err(["Canister cannot be initialized.", &e].join(""))
        }
        Ok(mission_control_id) => {
            let mission_control = add_mission_control(user, &mission_control_id);

            update_mission_control_controllers(&mission_control_id, user).await?;

            Ok(mission_control)
        }
    }
}
