use crate::wasm::satellite_controllers;
use candid::Principal;
use shared::ic::update_canister_controllers;
use shared::types::interface::MissionControlId;
use shared::types::state::UserId;

/// Once mission control is created:
/// 1. we remove the console from the controllers because the data are owned by the developers
/// 2. we add the newly created mission control canister as its own controllers. that way it can add future controllers such as those the developers will add to interact with the terminal.
pub async fn update_mission_control_controllers(
    mission_control_id: &Principal,
    user: &UserId,
) -> Result<(), String> {
    let controllers = Vec::from([*user, *mission_control_id]);
    let result = update_canister_controllers(*mission_control_id, controllers.to_owned()).await;

    match result {
        Err(_) => Err("Failed to update the controllers of the mission control.".to_string()),
        Ok(_) => Ok(()),
    }
}

// Satellite is ready - canister has been created and code has been installed once - we can remove the console of the list of the controllers of the satellite.
// Note: we install the code the first time with the console as a controller to avoid to have to populate the satellite wasm in each mission control center.
pub async fn remove_console_controller_from_satellite(
    satellite_id: &Principal,
    mission_control_id: &MissionControlId,
    user: &UserId,
) -> Result<(), String> {
    let controllers = satellite_controllers(user, mission_control_id);
    let result = update_canister_controllers(*satellite_id, controllers.to_owned()).await;

    match result {
        Err(_) => {
            Err("Failed to remove console from the controllers of the satellite.".to_string())
        }
        Ok(_) => Ok(()),
    }
}
