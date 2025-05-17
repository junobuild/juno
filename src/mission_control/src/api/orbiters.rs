use crate::controllers::orbiter::{delete_orbiter_controllers, set_orbiter_controllers};
use crate::guards::caller_is_user_or_admin_controller;
use crate::segments::orbiter::{attach_orbiter, delete_orbiter, detach_orbiter};
use crate::segments::store::get_orbiters;
use crate::types::interface::CreateCanisterConfig;
use crate::types::state::{Orbiter, Orbiters};
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, Metadata, OrbiterId, UserId};

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_orbiters() -> Orbiters {
    get_orbiters()
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn create_orbiter(name: Option<String>) -> Orbiter {
    crate::segments::orbiter::create_orbiter(&name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn create_orbiter_with_config(config: CreateCanisterConfig) -> Orbiter {
    crate::segments::orbiter::create_orbiter_with_config(&config)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_orbiter(orbiter_id: OrbiterId, name: Option<String>) -> Orbiter {
    attach_orbiter(&orbiter_id, &name)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn unset_orbiter(orbiter_id: OrbiterId) {
    detach_orbiter(&orbiter_id)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_orbiter_metadata(orbiter_id: OrbiterId, metadata: Metadata) -> Orbiter {
    crate::segments::store::set_orbiter_metadata(&orbiter_id, &metadata)
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn set_orbiters_controllers(
    orbiter_ids: Vec<OrbiterId>,
    controller_ids: Vec<ControllerId>,
    controller: SetController,
) {
    for orbiter_id in orbiter_ids {
        set_orbiter_controllers(&orbiter_id, &controller_ids, &controller)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_orbiters_controllers(orbiter_ids: Vec<OrbiterId>, controllers: Vec<UserId>) {
    for orbiter_id in orbiter_ids {
        delete_orbiter_controllers(&orbiter_id, &controllers)
            .await
            .unwrap_or_else(|e| trap(&e));
    }
}

#[update(guard = "caller_is_user_or_admin_controller")]
async fn del_orbiter(orbiter_id: OrbiterId, cycles_to_deposit: u128) {
    delete_orbiter(&orbiter_id, cycles_to_deposit)
        .await
        .unwrap_or_else(|e| trap(&e));
}
