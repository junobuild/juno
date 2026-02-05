use crate::constants::internal::REVOKED_CONTROLLERS;
use crate::env::{CONSOLE, OBSERVATORY};
use crate::errors::{
    JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY, JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
    JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST, JUNO_ERROR_CONTROLLERS_MAX_NUMBER,
    JUNO_ERROR_CONTROLLERS_REVOKED_NOT_ALLOWED,
};
use crate::ic::api::{id, is_canister_controller, time};
use crate::types::interface::SetController;
use crate::types::state::{Controller, ControllerId, ControllerScope, Controllers, UserId};
use crate::utils::{principal_anonymous, principal_equal, principal_not_anonymous};
use candid::Principal;
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
        kind: None,
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
            kind: controller_data.kind.clone(),
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

/// Checks if a caller is a non-expired controller with admin or write scope (permissions).
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `controllers`: Reference to the current set of controllers.
///
/// # Returns
/// `true` if the caller is a controller (not anonymous, calling itself or one of the known write or admin controllers), otherwise `false`.
pub fn controller_can_write(caller: UserId, controllers: &Controllers) -> bool {
    principal_not_anonymous(caller)
        && (caller_is_self(caller)
            || controllers
                .iter()
                .any(|(&controller_id, controller)| match controller.scope {
                    ControllerScope::Submit => false,
                    _ => {
                        principal_equal(controller_id, caller)
                            && is_controller_not_expired(controller)
                    }
                }))
}

/// Checks if a caller is a non-expired controller regardless of scope (admin, write, or submit).
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `controllers`: Reference to the current set of controllers.
///
/// # Returns
/// `true` if the caller is a controller (not anonymous, calling itself or one of the known controllers), otherwise `false`.
pub fn is_valid_controller(caller: UserId, controllers: &Controllers) -> bool {
    principal_not_anonymous(caller)
        && (caller_is_self(caller)
            || controllers.iter().any(|(&controller_id, controller)| {
                principal_equal(controller_id, caller) && is_controller_not_expired(controller)
            }))
}

/// Checks if a controller (access key) has not expired.
///
/// Admin controllers never expire. Other controllers are considered not expired if:
/// - They have no expiration date set, or
/// - Their expiration date is in the future
///
/// # Arguments
/// - `controller`: The controller to check
///
/// # Returns
/// `true` if the controller has not expired, `false` otherwise.
fn is_controller_not_expired(controller: &Controller) -> bool {
    !is_controller_expired(controller)
}

/// Checks if a controller (access key) has expired.
///
/// Admin controllers never expire. Other controllers are considered expired if:
/// - They have an expiration date set, and
/// - That expiration date is in the past
///
/// # Arguments
/// - `controller`: The controller to check
///
/// # Returns
/// `true` if the controller has expired, `false` otherwise.
fn is_controller_expired(controller: &Controller) -> bool {
    // Admin controller cannot expire
    if matches!(controller.scope, ControllerScope::Admin) {
        return false;
    }

    controller
        .expires_at
        .map_or(false, |expires_at| expires_at < time())
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
            "{JUNO_ERROR_CONTROLLERS_MAX_NUMBER} ({max_controllers})"
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

/// Validates controller expiration settings.
///
/// Ensures that:
/// - Admin controllers do not have an expiration date set
/// - If an expiration is set, it's not in the past
///
/// # Arguments
/// - `controller`: The controller configuration to validate
///
/// # Returns
/// `Ok(())` if validation passes, or `Err(String)` with error message if validation fails
pub fn assert_controller_expiration(controller: &SetController) -> Result<(), String> {
    if matches!(controller.scope, ControllerScope::Admin) && controller.expires_at.is_some() {
        return Err(JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY.to_string());
    }

    if let Some(expires_at) = controller.expires_at {
        if expires_at < time() {
            return Err(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST.to_string());
        }
    }

    Ok(())
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
    #[allow(clippy::match_like_matches_macro)]
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::state::{Controller, ControllerKind, ControllerScope, Controllers};
    use candid::Principal;
    use std::collections::HashMap;

    fn mock_time() -> u64 {
        1_000_000_000_000
    }

    fn test_principal(id: u8) -> Principal {
        Principal::from_slice(&[id])
    }

    fn create_controller(
        scope: ControllerScope,
        expires_at: Option<u64>,
        kind: Option<ControllerKind>,
    ) -> Controller {
        Controller {
            metadata: HashMap::new(),
            created_at: mock_time(),
            updated_at: mock_time(),
            expires_at,
            scope,
            kind,
        }
    }

    #[test]
    fn test_is_controller_expired_admin_never_expires() {
        let admin = create_controller(ControllerScope::Admin, Some(mock_time() - 1000), None);
        assert!(!is_controller_expired(&admin));
    }

    #[test]
    fn test_is_controller_expired_no_expiration() {
        let controller = create_controller(ControllerScope::Write, None, None);
        assert!(!is_controller_expired(&controller));
    }

    #[test]
    fn test_is_controller_expired_future_expiration() {
        let controller = create_controller(ControllerScope::Write, Some(time() + 1_000_000), None);
        assert!(!is_controller_expired(&controller));
    }

    #[test]
    fn test_is_controller_not_expired() {
        let admin = create_controller(ControllerScope::Admin, Some(time() - 1000), None);
        assert!(is_controller_not_expired(&admin));

        let expired = create_controller(ControllerScope::Write, Some(time() - 1), None);
        assert!(!is_controller_not_expired(&expired));

        let valid = create_controller(ControllerScope::Write, Some(time() + 1000), None);
        assert!(is_controller_not_expired(&valid));
    }

    #[test]
    fn test_is_controller_expired_past_expiration() {
        let controller = create_controller(ControllerScope::Write, Some(mock_time() - 1), None);
        assert!(is_controller_expired(&controller));
    }

    #[test]
    fn test_controller_can_write_anonymous_rejected() {
        let controllers = Controllers::new();
        assert!(!controller_can_write(Principal::anonymous(), &controllers));
    }

    #[test]
    fn test_controller_can_write_self_allowed() {
        let controllers = Controllers::new();
        let self_principal = id();
        assert!(controller_can_write(self_principal, &controllers));
    }

    #[test]
    fn test_controller_can_write_admin_allowed() {
        let mut controllers = Controllers::new();
        let admin_principal = test_principal(1);

        controllers.insert(
            admin_principal,
            create_controller(ControllerScope::Admin, None, None),
        );

        assert!(controller_can_write(admin_principal, &controllers));
    }

    #[test]
    fn test_controller_can_write_write_scope_allowed() {
        let mut controllers = Controllers::new();
        let write_principal = test_principal(2);

        controllers.insert(
            write_principal,
            create_controller(ControllerScope::Write, None, None),
        );

        assert!(controller_can_write(write_principal, &controllers));
    }

    #[test]
    fn test_controller_can_write_submit_rejected() {
        let mut controllers = Controllers::new();
        let submit_principal = test_principal(3);

        controllers.insert(
            submit_principal,
            create_controller(ControllerScope::Submit, None, None),
        );

        assert!(!controller_can_write(submit_principal, &controllers));
    }

    #[test]
    fn test_controller_can_write_expired_rejected() {
        let mut controllers = Controllers::new();
        let expired_principal = test_principal(4);

        controllers.insert(
            expired_principal,
            create_controller(ControllerScope::Write, Some(mock_time() - 1), None),
        );

        assert!(!controller_can_write(expired_principal, &controllers));
    }

    #[test]
    fn test_is_valid_controller_anonymous_rejected() {
        let controllers = Controllers::new();
        assert!(!is_valid_controller(Principal::anonymous(), &controllers));
    }

    #[test]
    fn test_is_valid_controller_self_allowed() {
        let controllers = Controllers::new();
        let self_principal = id();
        assert!(is_valid_controller(self_principal, &controllers));
    }

    #[test]
    fn test_is_valid_controller_all_scopes_allowed() {
        let mut controllers = Controllers::new();

        let admin = test_principal(1);
        let write = test_principal(2);
        let submit = test_principal(3);

        controllers.insert(admin, create_controller(ControllerScope::Admin, None, None));
        controllers.insert(write, create_controller(ControllerScope::Write, None, None));
        controllers.insert(
            submit,
            create_controller(ControllerScope::Submit, None, None),
        );

        assert!(is_valid_controller(admin, &controllers));
        assert!(is_valid_controller(write, &controllers));
        assert!(is_valid_controller(submit, &controllers));
    }

    #[test]
    fn test_is_valid_controller_expired_rejected() {
        let mut controllers = Controllers::new();
        let expired_principal = test_principal(4);

        controllers.insert(
            expired_principal,
            create_controller(ControllerScope::Write, Some(mock_time() - 1), None),
        );

        assert!(!is_valid_controller(expired_principal, &controllers));
    }

    #[test]
    fn test_is_valid_controller_admin_expired_still_valid() {
        let mut controllers = Controllers::new();
        let admin_principal = test_principal(5);

        // Admin with past expiration should still be valid (admins never expire)
        controllers.insert(
            admin_principal,
            create_controller(ControllerScope::Admin, Some(mock_time() - 1000), None),
        );

        assert!(is_valid_controller(admin_principal, &controllers));
    }

    #[test]
    fn test_init_admin_controllers() {
        let principals = vec![test_principal(1), test_principal(2)];
        let controllers = init_admin_controllers(&principals);

        assert_eq!(controllers.len(), 2);

        for principal in principals {
            let controller = controllers.get(&principal).unwrap();
            assert!(matches!(controller.scope, ControllerScope::Admin));
            assert!(controller.expires_at.is_none());
            assert!(controller.kind.is_none());
        }
    }

    #[test]
    fn test_set_controllers_new() {
        let mut controllers = Controllers::new();
        let principals = vec![test_principal(1)];

        let controller_data = SetController {
            metadata: HashMap::new(),
            expires_at: Some(mock_time() + 1000),
            scope: ControllerScope::Write,
            kind: Some(ControllerKind::Automation),
        };

        set_controllers(&principals, &controller_data, &mut controllers);

        assert_eq!(controllers.len(), 1);
        let controller = controllers.get(&principals[0]).unwrap();
        assert!(matches!(controller.scope, ControllerScope::Write));
        assert_eq!(controller.expires_at, Some(mock_time() + 1000));
        assert!(matches!(controller.kind, Some(ControllerKind::Automation)));
    }

    #[test]
    fn test_set_controllers_update_preserves_created_at() {
        let mut controllers = Controllers::new();
        let principal = test_principal(1);

        // First insert
        let initial_data = SetController {
            metadata: HashMap::new(),
            expires_at: None,
            scope: ControllerScope::Write,
            kind: None,
        };
        set_controllers(&[principal], &initial_data, &mut controllers);
        let original_created_at = controllers.get(&principal).unwrap().created_at;

        // Update
        let update_data = SetController {
            metadata: HashMap::new(),
            expires_at: Some(mock_time() + 1000),
            scope: ControllerScope::Admin,
            kind: Some(ControllerKind::Automation),
        };
        set_controllers(&[principal], &update_data, &mut controllers);

        let updated = controllers.get(&principal).unwrap();
        assert_eq!(updated.created_at, original_created_at);
        assert!(matches!(updated.scope, ControllerScope::Admin));
    }

    #[test]
    fn test_delete_controllers() {
        let mut controllers = Controllers::new();
        let principals = vec![test_principal(1), test_principal(2), test_principal(3)];

        for principal in &principals {
            controllers.insert(
                *principal,
                create_controller(ControllerScope::Write, None, None),
            );
        }

        delete_controllers(&principals[0..2], &mut controllers);

        assert_eq!(controllers.len(), 1);
        assert!(controllers.contains_key(&principals[2]));
        assert!(!controllers.contains_key(&principals[0]));
        assert!(!controllers.contains_key(&principals[1]));
    }

    #[test]
    fn test_filter_admin_controllers() {
        let mut controllers = Controllers::new();

        controllers.insert(
            test_principal(1),
            create_controller(ControllerScope::Admin, None, None),
        );
        controllers.insert(
            test_principal(2),
            create_controller(ControllerScope::Write, None, None),
        );
        controllers.insert(
            test_principal(3),
            create_controller(ControllerScope::Admin, None, None),
        );
        controllers.insert(
            test_principal(4),
            create_controller(ControllerScope::Submit, None, None),
        );

        let admin_only = filter_admin_controllers(&controllers);

        assert_eq!(admin_only.len(), 2);
        assert!(admin_only.contains_key(&test_principal(1)));
        assert!(admin_only.contains_key(&test_principal(3)));
    }

    #[test]
    fn test_is_admin_controller() {
        let mut controllers = Controllers::new();
        let admin_principal = id(); // Self canister in test

        controllers.insert(
            admin_principal,
            create_controller(ControllerScope::Admin, None, None),
        );

        assert!(is_admin_controller(admin_principal, &controllers));
    }

    #[test]
    fn test_is_admin_controller_not_canister_controller() {
        let mut controllers = Controllers::new();
        let not_canister = test_principal(99);

        controllers.insert(
            not_canister,
            create_controller(ControllerScope::Admin, None, None),
        );

        // Will fail because test_principal(99) is not the canister controller
        assert!(!is_admin_controller(not_canister, &controllers));
    }

    #[test]
    fn test_assert_expiration_controller_admin_with_expiry_rejected() {
        let controller = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() + 1000),
            scope: ControllerScope::Admin,
            kind: None,
        };

        let result = assert_controller_expiration(&controller);
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY.to_string()
        );
    }

    #[test]
    fn test_assert_expiration_controller_admin_without_expiry_allowed() {
        let controller = SetController {
            metadata: HashMap::new(),
            expires_at: None,
            scope: ControllerScope::Admin,
            kind: None,
        };

        let result = assert_controller_expiration(&controller);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_expiration_controller_past_expiry_rejected() {
        let controller = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() - 1000),
            scope: ControllerScope::Write,
            kind: None,
        };

        let result = assert_controller_expiration(&controller);
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST.to_string()
        );
    }

    #[test]
    fn test_assert_expiration_controller_future_expiry_allowed() {
        let controller = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() + 1000),
            scope: ControllerScope::Write,
            kind: None,
        };

        let result = assert_controller_expiration(&controller);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_expiration_controller_no_expiry_allowed() {
        let controller = SetController {
            metadata: HashMap::new(),
            expires_at: None,
            scope: ControllerScope::Write,
            kind: None,
        };

        let result = assert_controller_expiration(&controller);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_expiration_controller_submit_scope_with_future_expiry() {
        let controller = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() + 1000),
            scope: ControllerScope::Submit,
            kind: None,
        };

        let result = assert_controller_expiration(&controller);
        assert!(result.is_ok());
    }
}
