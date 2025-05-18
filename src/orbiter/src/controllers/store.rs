use crate::state::memory::STATE;
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, filter_admin_controllers,
    set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, Controllers};

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().heap.controllers,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(remove_controllers, &mut state.borrow_mut().heap.controllers)
    })
}

pub fn get_controllers() -> Controllers {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

pub fn get_admin_controllers() -> Controllers {
    STATE.with(|state| filter_admin_controllers(&state.borrow().heap.controllers))
}
