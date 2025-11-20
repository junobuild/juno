use crate::store::{mutate_heap_state, read_heap_state};
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, Controllers};

pub fn get_controllers() -> Controllers {
    read_heap_state(|heap| heap.controllers.clone())
}

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    mutate_heap_state(|heap| {
        set_controllers_impl(new_controllers, controller, &mut heap.controllers)
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    mutate_heap_state(|heap| delete_controllers_impl(remove_controllers, &mut heap.controllers))
}
