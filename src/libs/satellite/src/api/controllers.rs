use crate::controllers::store::{delete_controllers, set_controllers as set_controllers_store};
use crate::{get_admin_controllers, get_controllers};
use ic_cdk::trap;
use junobuild_shared::constants_shared::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use junobuild_shared::controllers::{assert_controllers, assert_max_number_of_controllers};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::types::state::{ControllerScope, Controllers};

pub fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    #[allow(clippy::single_match)]
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
        }
        _ => (),
    }

    assert_controllers(&controllers).unwrap_or_trap();

    set_controllers_store(&controllers, &controller);

    get_controllers()
}

pub fn del_controllers(
    DeleteControllersArgs { controllers }: DeleteControllersArgs,
) -> Controllers {
    delete_controllers(&controllers);

    get_controllers()
}

pub fn list_controllers() -> Controllers {
    get_controllers()
}
