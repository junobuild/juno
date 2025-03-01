use crate::memory::internal::STATE;
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

/// Retrieve the controllers of the Satellite.
///
/// This function retrieves the list of controllers currently set for the application.
/// A controller is represented as a key-value pair where the key is the `ControllerId`
/// (a `Principal`) and the value is a `Controller` struct containing metadata and scope
/// details about the controller.
///
/// # Returns
/// - `Controllers`: A `HashMap` where:
///   - The key is a `ControllerId` (type alias for `Principal`).
///   - The value is a `Controller` struct that includes:
///     - `metadata`: Additional metadata about the controller, such as name or description.
///     - `created_at`: The timestamp when the controller was created.
///     - `updated_at`: The timestamp when the controller was last updated.
///     - `expires_at`: An optional timestamp indicating when the controller expires.
///     - `scope`: The `ControllerScope`, which specifies the access level (`Write` or `Admin`).
///
/// # Example
/// ```
/// let controllers = get_controllers();
/// for (controller_id, controller) in controllers.iter() {
///     println!("Controller ID: {}", controller_id);
///     println!("Scope: {:?}", controller.scope);
///     if let Some(expires_at) = controller.expires_at {
///         println!("Expires at: {}", expires_at);
///     }
/// }
/// ```
///
/// This function is useful for checking the current permissions.
pub fn get_controllers() -> Controllers {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

/// Retrieve the current admin controllers for a Satellite.
///
/// This function filters the list of controllers to include only those with the `Admin` scope.
///
/// # Returns
/// - `Controllers`: A `HashMap` where:
///   - The key is a `ControllerId` (type alias for `Principal`).
///   - The value is a `Controller` struct that includes:
///     - `metadata`: Additional metadata about the controller.
///     - `created_at`: The timestamp when the controller was created.
///     - `updated_at`: The timestamp when the controller was last updated.
///     - `expires_at`: An optional timestamp indicating when the controller expires.
///     - `scope`: Always `ControllerScope::Admin` for admin controllers.
///
/// # Example
/// ```
/// let admin_controllers = get_admin_controllers();
/// for (controller_id, controller) in admin_controllers.iter() {
///     println!("Admin Controller ID: {}", controller_id);
///     println!("Created at: {}", controller.created_at);
/// }
/// ```
///
/// This function is useful for auditing or managing permissions for admin-level access.
pub fn get_admin_controllers() -> Controllers {
    STATE.with(|state| filter_admin_controllers(&state.borrow().heap.controllers))
}
