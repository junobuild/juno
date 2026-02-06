use crate::controllers::store::{delete_controllers, set_controllers as set_controllers_store};
use crate::get_controllers;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::segments::controllers::{
    assert_controller_expiration, assert_controllers, assert_max_number_of_controllers,
};
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::types::state::Controllers;

pub fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    assert_max_number_of_controllers(&get_controllers(), &controllers, &controller.scope, None)
        .unwrap_or_trap();

    assert_controllers(&controllers).unwrap_or_trap();

    assert_controller_expiration(&controller).unwrap_or_trap();

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
