use crate::memory::STATE;
use crate::types::state::HeapState;
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, filter_admin_controllers,
    set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{Controller, ControllerId, ControllerScope, Controllers};

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

// For historical reasons, the user (i.e., the owner) is stored separately from the controllers.
// Some features must be accessible to either controllers or the owner, so this function
// returns the combined set of effective controllers.
pub fn get_controllers_with_user() -> Controllers {
    STATE.with(|state| get_controllers_with_user_impl(&mut state.borrow_mut().heap))
}

fn get_controllers_with_user_impl(state: &mut HeapState) -> Controllers {
    // Unlikely, but covers a legacy design where the user might be missing (which was a design mistake).
    if let None = state.user.user {
        return state.controllers.clone();
    }

    let user_id = state.user.user.unwrap();

    // Unlikely.
    if state.controllers.contains_key(&user_id) {
        return state.controllers.clone();
    }

    let mut controllers = Controllers::with_capacity(state.controllers.len() + 1);
    controllers.extend(
        state
            .controllers
            .iter()
            .map(|(id, controller)| (*id, controller.clone())),
    );

    controllers.insert(
        user_id,
        Controller {
            metadata: state.user.metadata.clone(),
            created_at: state.user.created_at,
            updated_at: state.user.updated_at,
            expires_at: None,
            scope: ControllerScope::Admin,
        },
    );

    controllers
}
