use crate::controllers::segment::{delete_segment_controllers, set_segment_controllers};
use shared::types::interface::SetController;
use shared::types::state::{ControllerId, OrbiterId};

pub async fn set_orbiter_controllers(
    orbiter_id: &OrbiterId,
    controllers: &[ControllerId],
    controller: &SetController,
) -> Result<(), String> {
    set_segment_controllers(orbiter_id, controllers, controller).await
}

pub async fn delete_orbiter_controllers(
    orbiter_id: &OrbiterId,
    controllers: &[ControllerId],
) -> Result<(), String> {
    delete_segment_controllers(orbiter_id, controllers).await
}
