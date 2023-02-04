use crate::controllers::store::{add_controllers, get_controllers, remove_controllers};
use crate::store::get_user;
use ic_cdk::id;
use shared::ic::update_canister_controllers;
use shared::types::interface::{Controllers, UserId};

pub async fn add_mission_control_controllers(controllers: &[UserId]) -> Result<(), String> {
    add_controllers(controllers);

    let updated_controllers = get_controllers();

    update_controllers_settings(&updated_controllers).await
}

pub async fn remove_mission_control_controllers(controllers: &[UserId]) -> Result<(), String> {
    remove_controllers(controllers);

    let updated_controllers = get_controllers();

    update_controllers_settings(&updated_controllers).await
}

async fn update_controllers_settings(controllers: &Controllers) -> Result<(), String> {
    // Because the mission control updates its own settings it needs to be a controller
    let mission_control_id = id();

    // So do the owner / user
    let user = get_user();

    let result = update_canister_controllers(
        mission_control_id,
        [
            Vec::from([mission_control_id, user]),
            Vec::from_iter(controllers.clone()),
        ]
        .concat(),
    )
    .await;

    match result {
        Err(_) => Err("Failed to update mission control controllers settings.".to_string()),
        Ok(_) => Ok(()),
    }
}
