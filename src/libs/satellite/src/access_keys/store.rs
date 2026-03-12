use crate::memory::state::STATE;
use junobuild_shared::segments::controllers::{
    delete_controllers as delete_controllers_impl, filter_admin_controllers,
    set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, Controllers};

// ---------------------------------------------------------
// Access keys
// ---------------------------------------------------------

pub fn set_access_keys(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().heap.controllers,
        )
    })
}

pub fn delete_access_keys(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(remove_controllers, &mut state.borrow_mut().heap.controllers)
    })
}

/// Returns all access keys of this satellite.
///
/// Each entry is a `ControllerId` (a `Principal`) mapped to a `Controller` struct
/// containing metadata, scope, and optional expiry.
pub fn get_access_keys() -> Controllers {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

/// Returns all admin access keys of this satellite.
///
/// Filters the full access key list to only those with `ControllerScope::Admin`.
/// Admin access keys never expire and are also controllers of the canister
/// as defined by the Internet Computer.
pub fn get_admin_access_keys() -> Controllers {
    STATE.with(|state| filter_admin_controllers(&state.borrow().heap.controllers))
}
