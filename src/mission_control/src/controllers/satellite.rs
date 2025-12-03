use crate::controllers::segment::{delete_segment_controllers, set_segment_controllers};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, SatelliteId};

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
