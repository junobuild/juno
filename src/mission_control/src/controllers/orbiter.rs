use crate::controllers::segment::{delete_segment_controllers, set_segment_controllers};
use junobuild_shared::types::interface::SetAccessKey;
use junobuild_shared::types::state::{AccessKeyId, OrbiterId};

pub async fn set_orbiter_controllers(
    orbiter_id: &OrbiterId,
    controllers: &[AccessKeyId],
    controller: &SetAccessKey,
) -> Result<(), String> {
    set_segment_controllers(orbiter_id, controllers, controller).await
}

pub async fn delete_orbiter_controllers(
    orbiter_id: &OrbiterId,
    controllers: &[AccessKeyId],
) -> Result<(), String> {
    delete_segment_controllers(orbiter_id, controllers).await
}
