use crate::store::heap::{delete_controllers, set_controllers as set_controllers_store};
use ic_cdk_macros::update;
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use crate::guards::caller_is_admin_controller;

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) {
    set_controllers_store(&controllers, &controller);
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) {
    delete_controllers(&controllers);
}
