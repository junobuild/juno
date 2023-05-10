use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::controllers::{filter_admin_controllers, into_controller_ids};
use shared::ic::update_canister_controllers;
use shared::types::interface::{DeleteControllersArgs, SetController, SetControllersArgs};
use shared::types::state::{ControllerId, Controllers, SatelliteId};

#[deprecated(since = "0.0.3", note = "please use `set_controllers` instead")]
pub async fn add_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let updated_controllers = add_controllers(satellite_id, controllers).await?;

    update_controllers_settings(satellite_id, &updated_controllers).await
}

#[deprecated(since = "0.0.3", note = "please use `set_controllers` instead")]
pub async fn remove_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let updated_controllers = remove_controllers(satellite_id, controllers).await?;

    update_controllers_settings(satellite_id, &updated_controllers).await
}

pub async fn set_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<(), String> {
    let satellite_admin_controllers =
        set_controllers(satellite_id, controllers, controller).await?;

    // We update the IC controllers because it is possible that an existing controller was updated.
    // e.g. existing controller was Read-Write and becomes Administrator.
    update_controllers_settings(satellite_id, &satellite_admin_controllers).await
}

pub async fn delete_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let satellite_admin_controllers = delete_controllers(satellite_id, controllers).await?;

    // For simplicity reason we update the list of controllers even if we removed only Write scoped controllers.
    update_controllers_settings(satellite_id, &satellite_admin_controllers).await
}

#[deprecated(since = "0.0.3", note = "please use `set_controllers` instead")]
async fn add_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<Vec<ControllerId>, String> {
    // We use DeleteControllersArgs for convenience reason. Deprecated function indeed required only a list of principal to add controllers.
    let args = DeleteControllersArgs {
        controllers: controllers.to_owned(),
    };

    let result: CallResult<(Vec<ControllerId>,)> =
        call(*satellite_id, "add_controllers", (args,)).await;

    match result {
        Err((_, message)) => Err(["Failed to add controllers to satellite.", &message].join(" - ")),
        Ok((result,)) => Ok(result),
    }
}

#[deprecated(since = "0.0.3", note = "please use `delete_controllers` instead")]
async fn remove_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<Vec<ControllerId>, String> {
    let args = DeleteControllersArgs {
        controllers: controllers.to_owned(),
    };

    let result: CallResult<(Vec<ControllerId>,)> =
        call(*satellite_id, "remove_controllers", (args,)).await;

    match result {
        Err((_, message)) => {
            Err(["Failed to remove controllers from satellite.", &message].join(" - "))
        }
        Ok((result,)) => Ok(result),
    }
}

async fn set_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<Vec<ControllerId>, String> {
    let args = SetControllersArgs {
        controllers: controllers.to_owned(),
        controller: controller.clone(),
    };

    let result: CallResult<(Controllers,)> = call(*satellite_id, "set_controllers", (args,)).await;

    match result {
        Err((_, message)) => Err(["Failed to set controllers to satellite.", &message].join(" - ")),
        Ok((controllers,)) => Ok(into_controller_ids(&filter_admin_controllers(&controllers))),
    }
}

async fn delete_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<Vec<ControllerId>, String> {
    let args = DeleteControllersArgs {
        controllers: controllers.to_owned(),
    };

    let result: CallResult<(Controllers,)> = call(*satellite_id, "del_controllers", (args,)).await;

    match result {
        Err((_, message)) => {
            Err(["Failed to delete controllers from satellite.", &message].join(" - "))
        }
        Ok((controllers,)) => Ok(into_controller_ids(&filter_admin_controllers(&controllers))),
    }
}

async fn update_controllers_settings(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let result = update_canister_controllers(*satellite_id, controllers.to_owned()).await;

    match result {
        Err(_) => Err("Failed to update satellite controllers settings.".to_string()),
        Ok(_) => Ok(()),
    }
}
