use crate::guards::caller_is_admin_controller;
use crate::store::heap::{
    delete_controllers, get_controllers, set_controllers as set_controllers_store,
};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::segments::controllers::{
    assert_controller_expiration, assert_controllers, assert_max_number_of_controllers,
};
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::types::state::Controllers;

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    assert_max_number_of_controllers(&get_controllers(), &controllers, &controller.scope, None)
        .unwrap_or_trap();

    assert_controllers(&controllers).unwrap_or_trap();

    assert_controller_expiration(&controller).unwrap_or_trap();

    set_controllers_store(&controllers, &controller);
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_controllers(&controllers);
}

#[query(guard = "caller_is_admin_controller")]
fn list_controllers() -> Controllers {
    get_controllers()
}
