use crate::controllers::store::get_controllers;
use crate::guards::caller_is_user_or_admin_controller;
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, ControllerScope, Controllers, UserId};
use std::collections::HashMap;

#[deprecated(
    since = "0.0.3",
    note = "please use `set_mission_control_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn add_mission_control_controllers(controllers: Vec<UserId>) {
    let controller: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
        scope: ControllerScope::Admin,
    };

    crate::controllers::mission_control::set_mission_control_controllers(&controllers, &controller)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[deprecated(
    since = "0.0.3",
    note = "please use `del_mission_control_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn remove_mission_control_controllers(controllers: Vec<ControllerId>) {
    crate::controllers::mission_control::delete_mission_control_controllers(&controllers)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_mission_control_controllers(
    controllers: Vec<ControllerId>,
    controller: SetController,
) {
    crate::controllers::mission_control::set_mission_control_controllers(&controllers, &controller)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_mission_control_controllers(controllers: Vec<ControllerId>) {
    crate::controllers::mission_control::delete_mission_control_controllers(&controllers)
        .await
        .unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_mission_control_controllers() -> Controllers {
    get_controllers()
}
