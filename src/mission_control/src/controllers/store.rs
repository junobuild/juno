use crate::STATE;
use shared::controllers::{
    add_controllers as add_controllers_impl, remove_controllers as remove_controllers_impl,
};
use shared::types::state::Controllers;
use shared::types::state::UserId;

/// Controllers

pub fn add_controllers(new_controllers: &[UserId]) {
    STATE.with(|state| {
        add_controllers_impl(new_controllers, &mut state.borrow_mut().stable.controllers)
    })
}

pub fn remove_controllers(remove_controllers: &[UserId]) {
    STATE.with(|state| {
        remove_controllers_impl(
            remove_controllers,
            &mut state.borrow_mut().stable.controllers,
        )
    })
}

pub fn get_controllers() -> Controllers {
    STATE.with(|state| state.borrow().stable.controllers.clone())
}
