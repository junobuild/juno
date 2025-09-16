use crate::controllers::satellite::{
    add_satellite_controllers as add_satellite_controllers_impl, delete_satellite_controllers,
    remove_satellite_controllers as remove_satellite_controllers_impl, set_satellite_controllers,
};
use crate::guards::caller_is_user_or_admin_controller;
use crate::segments::satellite::{
    attach_satellite, create_satellite as create_satellite_console,
    create_satellite_with_config as create_satellite_with_config_console, delete_satellite,
    detach_satellite,
};
use crate::segments::store::{
    get_satellites, set_satellite_metadata as set_satellite_metadata_store,
};
use crate::types::interface::CreateCanisterConfig;
use crate::types::state::{Satellite, Satellites};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, SatelliteId};
use junobuild_shared::types::state::{Metadata, UserId};

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_satellites() -> Satellites {
    get_satellites()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn create_satellite(name: String) -> Satellite {
    create_satellite_console(&name).await.unwrap_or_trap()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn create_satellite_with_config(config: CreateCanisterConfig) -> Satellite {
    create_satellite_with_config_console(&config)
        .await
        .unwrap_or_trap()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_satellite_metadata(satellite_id: SatelliteId, metadata: Metadata) -> Satellite {
    set_satellite_metadata_store(&satellite_id, &metadata).unwrap_or_trap()
}

#[deprecated(
    since = "0.0.3",
    note = "please use `set_satellites_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn add_satellites_controllers(
    satellite_ids: Vec<SatelliteId>,
    controllers: Vec<ControllerId>,
) {
    for satellite_id in satellite_ids {
        add_satellite_controllers_impl(&satellite_id, &controllers)
            .await
            .unwrap_or_trap();
    }
}

#[deprecated(
    since = "0.0.3",
    note = "please use `del_satellites_controllers` instead"
)]
#[update(guard = "caller_is_user_or_admin_controller")]
async fn remove_satellites_controllers(
    satellite_ids: Vec<SatelliteId>,
    controllers: Vec<ControllerId>,
) {
    for satellite_id in satellite_ids {
        remove_satellite_controllers_impl(&satellite_id, &controllers)
            .await
            .unwrap_or_trap();
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_satellites_controllers(
    satellite_ids: Vec<SatelliteId>,
    controller_ids: Vec<ControllerId>,
    controller: SetController,
) {
    for satellite_id in satellite_ids {
        set_satellite_controllers(&satellite_id, &controller_ids, &controller)
            .await
            .unwrap_or_trap();
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_satellites_controllers(satellite_ids: Vec<SatelliteId>, controllers: Vec<UserId>) {
    for satellite_id in satellite_ids {
        delete_satellite_controllers(&satellite_id, &controllers)
            .await
            .unwrap_or_trap();
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_satellite(satellite_id: SatelliteId, cycles_to_deposit: u128) {
    delete_satellite(&satellite_id, cycles_to_deposit)
        .await
        .unwrap_or_trap();
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_satellite(satellite_id: SatelliteId, name: Option<String>) -> Satellite {
    attach_satellite(&satellite_id, &name)
        .await
        .unwrap_or_trap()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn unset_satellite(satellite_id: SatelliteId) {
    detach_satellite(&satellite_id).await.unwrap_or_trap()
}
