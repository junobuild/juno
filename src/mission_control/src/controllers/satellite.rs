use crate::controllers::segment::{
    delete_segment_controllers, set_segment_controllers, update_segment_controllers_settings,
};
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::types::interface::{DeleteControllersArgs, SetController};
use shared::types::state::{ControllerId, SatelliteId};

#[deprecated(since = "0.0.3", note = "please use `set_controllers` instead")]
pub async fn add_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let updated_controllers = add_controllers(satellite_id, controllers).await?;

    update_segment_controllers_settings(satellite_id, &updated_controllers).await
}

#[deprecated(since = "0.0.3", note = "please use `set_controllers` instead")]
pub async fn remove_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    let updated_controllers = remove_controllers(satellite_id, controllers).await?;

    update_segment_controllers_settings(satellite_id, &updated_controllers).await
}

pub async fn set_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<(), String> {
    set_segment_controllers(satellite_id, controllers, controller).await
}

pub async fn delete_satellite_controllers(
    satellite_id: &SatelliteId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    delete_segment_controllers(satellite_id, controllers).await
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
