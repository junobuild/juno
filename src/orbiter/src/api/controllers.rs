use crate::controllers::store::{
    delete_controllers as delete_controllers_store, get_admin_controllers, get_controllers,
    set_controllers as set_controllers_store,
};
use crate::guards::caller_is_admin_controller;
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::constants_shared::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use junobuild_shared::controllers::{assert_controllers, assert_max_number_of_controllers};
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::types::state::{ControllerScope, Controllers};

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    match controller.scope {
        ControllerScope::Admin => {
            let max_controllers = assert_max_number_of_controllers(
                &get_admin_controllers(),
                &controllers,
                MAX_NUMBER_OF_SATELLITE_CONTROLLERS,
            );

            if let Err(err) = max_controllers {
                trap(&err)
            }
        },
        _ => ()
    }

    assert_controllers(&controllers).unwrap_or_else(|e| trap(&e));

    set_controllers_store(&controllers, &controller);
    get_controllers()
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) -> Controllers {
    delete_controllers_store(&controllers);
    get_controllers()
}

#[query(guard = "caller_is_admin_controller")]
fn list_controllers() -> Controllers {
    get_controllers()
}
