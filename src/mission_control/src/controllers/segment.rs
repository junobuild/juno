use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::controllers::{filter_admin_controllers, into_controller_ids};
use shared::ic::update_canister_controllers;
use shared::types::interface::{DeleteControllersArgs, SetController, SetControllersArgs};
use shared::types::state::{ControllerId, Controllers};

pub async fn set_segment_controllers(
    segment_id: &Principal,
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<(), String> {
    let satellite_admin_controllers = set_controllers(segment_id, controllers, controller).await?;

    // We update the IC controllers because it is possible that an existing controller was updated.
    // e.g. existing controller was Read-Write and becomes Administrator.
    update_segment_controllers_settings(segment_id, &satellite_admin_controllers).await
}

pub async fn delete_segment_controllers(
    segment_id: &Principal,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let satellite_admin_controllers = delete_controllers(segment_id, controllers).await?;

    // For simplicity reason we update the list of controllers even if we removed only Write scoped controllers.
    update_segment_controllers_settings(segment_id, &satellite_admin_controllers).await
}

async fn set_controllers(
    segment_id: &Principal,
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<Vec<ControllerId>, String> {
    let args = SetControllersArgs {
        controllers: controllers.to_owned(),
        controller: controller.clone(),
    };

    let result: CallResult<(Controllers,)> = call(*segment_id, "set_controllers", (args,)).await;

    match result {
        Err((_, message)) => Err(["Failed to set controllers.", &message].join(" - ")),
        Ok((controllers,)) => Ok(into_controller_ids(&filter_admin_controllers(&controllers))),
    }
}

async fn delete_controllers(
    segment_id: &Principal,
    controllers: &[ControllerId],
) -> Result<Vec<ControllerId>, String> {
    let args = DeleteControllersArgs {
        controllers: controllers.to_owned(),
    };

    let result: CallResult<(Controllers,)> = call(*segment_id, "del_controllers", (args,)).await;

    match result {
        Err((_, message)) => Err(["Failed to delete controllers.", &message].join(" - ")),
        Ok((controllers,)) => Ok(into_controller_ids(&filter_admin_controllers(&controllers))),
    }
}

pub async fn update_segment_controllers_settings(
    segment_id: &Principal,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let result = update_canister_controllers(*segment_id, controllers.to_owned()).await;

    match result {
        Err(_) => Err("Failed to update controllers settings.".to_string()),
        Ok(_) => Ok(()),
    }
}
