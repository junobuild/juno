use crate::memory::state::STATE;
use junobuild_shared::segments::access_keys::{
    delete_access_keys as delete_controllers_impl, filter_admin_access_keys,
    set_access_keys as set_controllers_impl,
};
use junobuild_shared::types::interface::SetAccessKey;
use junobuild_shared::types::state::{AccessKeyId, AccessKeys};

// ---------------------------------------------------------
// Access keys
// ---------------------------------------------------------

pub fn set_access_keys(new_controllers: &[AccessKeyId], controller: &SetAccessKey) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().heap.controllers,
        )
    })
}

pub fn delete_access_keys(remove_controllers: &[AccessKeyId]) {
    STATE.with(|state| {
        delete_controllers_impl(remove_controllers, &mut state.borrow_mut().heap.controllers)
    })
}

/// Returns all access keys of this satellite.
///
/// Each entry is a `ControllerId` (a `Principal`) mapped to a `Controller` struct
/// containing metadata, scope, and optional expiry.
pub fn get_access_keys() -> AccessKeys {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

/// Returns all admin access keys of this satellite.
///
/// Filters the full access key list to only those with `ControllerScope::Admin`.
/// Admin access keys never expire and are also controllers of the canister
/// as defined by the Internet Computer.
pub fn get_admin_access_keys() -> AccessKeys {
    STATE.with(|state| filter_admin_access_keys(&state.borrow().heap.controllers))
}
