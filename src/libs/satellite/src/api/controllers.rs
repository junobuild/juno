use crate::access_keys::store::{delete_access_keys, set_access_keys as set_controllers_store};
use crate::{caller, get_access_keys};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::segments::controllers::{
    assert_controller_expiration, assert_controllers, assert_max_number_of_controllers,
};
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::types::state::{ControllerId, Controllers};

pub fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    assert_max_number_of_controllers(&get_access_keys(), &controllers, &controller.scope, None)
        .unwrap_or_trap();

    assert_controllers(&controllers).unwrap_or_trap();

    assert_controller_expiration(&controller).unwrap_or_trap();

    set_controllers_store(&controllers, &controller);

    get_access_keys()
}

pub fn del_controllers(
    DeleteControllersArgs { controllers }: DeleteControllersArgs,
) -> Controllers {
    delete_access_keys(&controllers);

    get_access_keys()
}

pub fn del_controller_self() {
    let caller = caller();
    let controllers: [ControllerId; 1] = [caller];

    delete_access_keys(&controllers);
}

pub fn list_controllers() -> Controllers {
    get_access_keys()
}
