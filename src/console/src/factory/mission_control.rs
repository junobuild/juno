use crate::accounts::{delete_account, update_mission_control};
use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::utils::controllers::update_mission_control_controllers;
use crate::factory::utils::wasm::mission_control_wasm_arg;
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_MISSION_CONTROL_CYCLES;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::state::UserId;

pub async fn create_mission_control(user_id: &UserId) -> Result<Principal, String> {
    // TODO: assert account has not yet a mission control
    // TODO: credits and payments

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
            // We delete the pending empty account from the list - e.g. this can happen if manager is out of cycles and user would be blocked
            delete_account(user_id);
            Err(["Canister cannot be initialized.", &e].join(""))
        }
        Ok(mission_control_id) => {
            // There error is unlikely to happen as the implementation ensures an
            // account was created before calling this factory function.
            let _ = update_mission_control(user_id, &mission_control_id)?;

            update_mission_control_controllers(&mission_control_id, user_id).await?;

            Ok(mission_control_id)
        }
    }
}
