use crate::constants_internal::REVOKED_CONTROLLERS;
use crate::env::{CONSOLE, OBSERVATORY};
use crate::errors::{
    JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED, JUNO_ERROR_CONTROLLERS_MAX_NUMBER,
    JUNO_ERROR_CONTROLLERS_REVOKED_NOT_ALLOWED,
};
use crate::types::interface::SetController;
use crate::types::state::{Controller, ControllerId, ControllerScope, Controllers, UserId};
use crate::utils::{principal_anonymous, principal_equal, principal_not_anonymous};
use candid::Principal;
use ic_cdk::api::{is_controller as is_canister_controller, time};
use ic_cdk::id;
use std::collections::HashMap;

/// Initializes a set of controllers with default administrative scope.
///
/// # Arguments
/// - `new_controllers`: Slice of `UserId` representing the new controllers to be initialized.
///
/// # Returns
/// A `Controllers` collection populated with the specified new controllers.
pub fn init_admin_controllers(new_controllers: &[UserId]) -> Controllers {
    let mut controllers: Controllers = Controllers::new();

    let controller_data: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
        scope: ControllerScope::Admin,
    };

    set_controllers(new_controllers, &controller_data, &mut controllers);

    controllers
}

/// Sets or updates controllers with specified data.
///
/// # Arguments
/// - `new_controllers`: Slice of `UserId` for the controllers to be set or updated.
/// - `controller_data`: `SetController` data to apply to the controllers.
/// - `controllers`: Mutable reference to the current set of controllers to update.
pub fn set_controllers(
    new_controllers: &[UserId],
    controller_data: &SetController,
    controllers: &mut Controllers,
) {
    for controller_id in new_controllers {
        let existing_controller = controllers.get(controller_id);

        let now = time();

        let created_at: u64 = match existing_controller {
            None => now,
            Some(existing_controller) => existing_controller.created_at,
        };

        let updated_at: u64 = now;

        let controller: Controller = Controller {
            metadata: controller_data.metadata.clone(),
            created_at,
            updated_at,
            expires_at: controller_data.expires_at,
            scope: controller_data.scope.clone(),
        };

        controllers.insert(*controller_id, controller);
    }
}

/// Removes specified controllers from the set.
///
/// # Arguments
/// - `remove_controllers`: Slice of `UserId` for the controllers to be removed.
/// - `controllers`: Mutable reference to the current set of controllers to update.
pub fn delete_controllers(remove_controllers: &[UserId], controllers: &mut Controllers) {
    for c in remove_controllers {
        controllers.remove(c);
    }
}

// TODO: rename to is_write_controller
/// Checks if a caller is a controller.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `controllers`: Reference to the current set of controllers.
///
/// # Returns
/// `true` if the caller is a controller (not anonymous, calling itself or one of the known controllers), otherwise `false`.
pub fn is_controller(caller: UserId, controllers: &Controllers) -> bool {
    principal_not_anonymous(caller)
        && (caller_is_self(caller)
            || controllers
                .iter()
                .any(|(&controller_id, controller)| match controller.scope {
                    ControllerScope::Submit => false,
                    _ => principal_equal(controller_id, caller),
                }))
}

/// Checks if a caller is an admin controller.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `controllers`: Reference to the current set of controllers.
///
/// # Returns
/// `true` if the caller is an admin controller, otherwise `false`.
pub fn is_admin_controller(caller: UserId, controllers: &Controllers) -> bool {
    is_canister_controller(&caller)
        && principal_not_anonymous(caller)
        && controllers
            .iter()
            .any(|(&controller_id, controller)| match controller.scope {
                ControllerScope::Admin => principal_equal(controller_id, caller),
                _ => false,
            })
}

/// Converts the controllers set into a vector of controller IDs.
///
/// # Arguments
/// - `controllers`: Reference to the current set of controllers.
///
/// # Returns
/// A vector of `ControllerId`.
pub fn into_controller_ids(controllers: &Controllers) -> Vec<ControllerId> {
    controllers
        .clone()
        .into_keys()
        .collect::<Vec<ControllerId>>()
}

/// Asserts that the number of controllers does not exceed the maximum allowed.
///
/// # Arguments
/// - `current_controllers`: Reference to the current set of controllers.
/// - `controllers_ids`: Slice of `ControllerId` representing the controllers to be added.
/// - `max_controllers`: Maximum number of allowed controllers.
///
/// # Returns
/// `Ok(())` if the operation is successful, or `Err(String)` if the maximum is exceeded.
pub fn assert_max_number_of_controllers(
    current_controllers: &Controllers,
    controllers_ids: &[ControllerId],
    max_controllers: usize,
) -> Result<(), String> {
    let current_controller_ids = into_controller_ids(current_controllers);

    let new_controller_ids = controllers_ids.iter().copied().filter(|id| {
        !current_controller_ids
            .iter()
            .any(|current_id| current_id == id)
    });

    if current_controller_ids.len() + new_controller_ids.count() > max_controllers {
        return Err(format!(
            "{} ({})",
            JUNO_ERROR_CONTROLLERS_MAX_NUMBER, max_controllers
        ));
    }

    Ok(())
}

/// Asserts that the controller IDs are not anonymous and not revoked.
///
/// # Arguments
/// - `controllers_ids`: Slice of `ControllerId` to validate.
///
/// # Returns
/// `Ok(())` if no anonymous and no revoked IDs are present, or `Err(String)` if any are found.
pub fn assert_controllers(controllers_ids: &[ControllerId]) -> Result<(), String> {
    assert_no_anonymous_controller(controllers_ids)?;
    assert_no_revoked_controller(controllers_ids)?;

    Ok(())
}

/// Asserts that no controller IDs are anonymous.
///
/// # Arguments
/// - `controllers_ids`: Slice of `ControllerId` to validate.
///
/// # Returns
/// `Ok(())` if no anonymous IDs are present, or `Err(String)` if any are found.
fn assert_no_anonymous_controller(controllers_ids: &[ControllerId]) -> Result<(), String> {
    let has_anonymous = controllers_ids
        .iter()
        .any(|controller_id| principal_anonymous(*controller_id));

    match has_anonymous {
        true => Err(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED.to_string()),
        false => Ok(()),
    }
}

/// Asserts that no controller IDs are revoked for security reason.
///
/// # Arguments
/// - `controllers_ids`: Slice of `ControllerId` to validate.
///
/// # Returns
/// `Ok(())` if no revoked IDs are present, or `Err(String)` if any are found.
fn assert_no_revoked_controller(controllers_ids: &[ControllerId]) -> Result<(), String> {
    // We treat revoked controllers as anonymous controllers.
    let has_revoked = controllers_ids.iter().any(controller_revoked);

    match has_revoked {
        true => Err(JUNO_ERROR_CONTROLLERS_REVOKED_NOT_ALLOWED.to_string()),
        false => Ok(()),
    }
}

/// Checks if the caller is the console.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
///
/// # Returns
/// `true` if the caller matches the console's principal, otherwise `false`.
pub fn caller_is_console(caller: UserId) -> bool {
    let console = Principal::from_text(CONSOLE).unwrap();

    principal_equal(caller, console)
}

/// Checks if the caller is the observatory.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
///
/// # Returns
/// `true` if the caller matches the observatory's principal, otherwise `false`.
pub fn caller_is_observatory(caller: UserId) -> bool {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    principal_equal(caller, observatory)
}

/// Checks if the caller is the canister itself.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
///
/// # Returns
/// `true` if the caller is calling itself, if the canister is the caller, otherwise `false`.
pub fn caller_is_self(caller: UserId) -> bool {
    let itself = id();

    principal_equal(caller, itself)
}

/// Filters the set of controllers, returning only those with administrative scope.
///
/// # Arguments
/// - `controllers`: Reference to the current set of controllers.
///
/// # Returns
/// A `Controllers` collection containing only admin controllers.
pub fn filter_admin_controllers(controllers: &Controllers) -> Controllers {
    controllers
        .clone()
        .into_iter()
        .filter(|(_, controller)| match controller.scope {
            ControllerScope::Admin => true,
            _ => false,
        })
        .collect()
}

fn controller_revoked(controller_id: &ControllerId) -> bool {
    REVOKED_CONTROLLERS.iter().any(|revoked_controller_id| {
        principal_equal(
            Principal::from_text(revoked_controller_id).unwrap(),
            *controller_id,
        )
    })
}
