use crate::STATE;
use shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use shared::types::interface::SetController;
use shared::types::state::{ControllerId, Controllers};

/// Controllers

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            &mut state.borrow_mut().stable.controllers,
            controller,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(
            remove_controllers,
            &mut state.borrow_mut().stable.controllers,
        )
    })
}

pub fn get_controllers() -> Controllers {
    STATE.with(|state| state.borrow().stable.controllers.clone())
}
