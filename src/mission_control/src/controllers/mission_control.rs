use crate::controllers::store::{delete_controllers, get_controllers, set_controllers};
use crate::store::get_user;
use ic_cdk::id;
use shared::constants::MAX_NUMBER_OF_MISSION_CONTROL_CONTROLLERS;
use shared::controllers::{assert_max_number_of_controllers, into_controller_ids};
use shared::ic::update_canister_controllers;
use shared::types::interface::SetController;
use shared::types::state::{ControllerId, Controllers};

pub async fn set_mission_control_controllers(
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<(), String> {
    assert_max_number_of_controllers(
        &get_controllers(),
        controllers,
        MAX_NUMBER_OF_MISSION_CONTROL_CONTROLLERS,
    )?;

    set_controllers(controllers, controller);

    let updated_controllers = get_controllers();

    update_controllers_settings(&updated_controllers).await
}

pub async fn delete_mission_control_controllers(
    controllers: &[ControllerId],
) -> Result<(), String> {
    delete_controllers(controllers);

    let updated_controllers = get_controllers();

    update_controllers_settings(&updated_controllers).await
}

async fn update_controllers_settings(controllers: &Controllers) -> Result<(), String> {
    // Because the mission control updates its own settings it needs to be a controller
    let mission_control_id = id();

    // So do the owner / user
    let user = get_user();

    let controller_ids = into_controller_ids(controllers);

    let result = update_canister_controllers(
        mission_control_id,
        [
            Vec::from([mission_control_id, user]),
            Vec::from_iter(controller_ids),
        ]
        .concat(),
    )
    .await;

    match result {
        Err(_) => Err("Failed to update mission control controllers settings.".to_string()),
        Ok(_) => Ok(()),
    }
}
