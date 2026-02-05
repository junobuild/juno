use crate::types::rules::Permission;
use candid::Principal;
use junobuild_shared::segments::controllers::controller_can_write;
use junobuild_shared::types::state::{Controllers, UserId};
use junobuild_shared::utils::{principal_not_anonymous, principal_not_anonymous_and_equal};

pub fn assert_permission(
    permission: &Permission,
    owner: Principal,
    caller: Principal,
    controllers: &Controllers,
) -> bool {
    assert_permission_with(permission, owner, caller, controllers, controller_can_write)
}

pub fn assert_permission_with(
    permission: &Permission,
    owner: Principal,
    caller: Principal,
    controllers: &Controllers,
    is_allowed_controller: fn(UserId, &Controllers) -> bool,
) -> bool {
    match permission {
        Permission::Public => true,
        Permission::Private => is_owner_and_valid(caller, owner, controllers),
        Permission::Managed => {
            // if owner, then it's either not a controller or a valid controller
            // else if valid controller
            is_owner_and_valid(caller, owner, controllers)
                || controller_can_write(caller, controllers)
        }
        Permission::Controllers => is_allowed_controller(caller, controllers),
    }
}

/// If a document or asset is about to be created for the first time, it can be initialized without further rules unless the collection is set as controller and the caller is not a controller.
/// This can be useful e.g. when a collection read permission is set to public but only the administrator can add content.
pub fn assert_create_permission(
    permission: &Permission,
    caller: Principal,
    controllers: &Controllers,
) -> bool {
    assert_create_permission_with(permission, caller, controllers, controller_can_write)
}

pub fn assert_create_permission_with(
    permission: &Permission,
    caller: Principal,
    controllers: &Controllers,
    is_allowed_controller: fn(UserId, &Controllers) -> bool,
) -> bool {
    match permission {
        Permission::Public => true,
        Permission::Controllers => is_allowed_controller(caller, controllers),
        _ => {
            assert_not_anonymous(caller)
                && (is_not_controller(caller, controllers)
                    || controller_can_write(caller, controllers))
        }
    }
}

fn is_owner(caller: Principal, owner: Principal) -> bool {
    principal_not_anonymous_and_equal(caller, owner)
}

fn assert_not_anonymous(caller: Principal) -> bool {
    principal_not_anonymous(caller)
}

pub fn public_permission(permission: &Permission) -> bool {
    matches!(permission, Permission::Public)
}

fn is_controller(caller: Principal, controllers: &Controllers) -> bool {
    controllers.contains_key(&caller)
}

fn is_not_controller(caller: Principal, controllers: &Controllers) -> bool {
    !is_controller(caller, controllers)
}

fn is_owner_and_valid(caller: Principal, owner: Principal, controllers: &Controllers) -> bool {
    is_owner(caller, owner)
        && (is_not_controller(caller, controllers) || controller_can_write(caller, controllers))
}

#[cfg(test)]
mod tests {
    use super::*;
    use junobuild_shared::types::state::{Controller, ControllerScope, Controllers};
    use std::collections::HashMap;

    fn test_principal(id: u8) -> Principal {
        Principal::from_slice(&[id])
    }

    fn create_controller(scope: ControllerScope, expires_at: Option<u64>) -> Controller {
        Controller {
            metadata: HashMap::new(),
            created_at: 1000,
            updated_at: 1000,
            expires_at,
            scope,
            kind: None,
        }
    }

    fn mock_time() -> u64 {
        1_000_000_000_000
    }

    #[test]
    fn test_is_owner() {
        let owner = test_principal(1);
        let caller = test_principal(1);
        let other = test_principal(2);

        assert!(is_owner(caller, owner));
        assert!(!is_owner(other, owner));
        assert!(!is_owner(Principal::anonymous(), owner));
    }

    #[test]
    fn test_is_controller() {
        let mut controllers = Controllers::new();
        let controller_principal = test_principal(1);
        let non_controller = test_principal(2);

        controllers.insert(
            controller_principal,
            create_controller(ControllerScope::Write, None),
        );

        assert!(is_controller(controller_principal, &controllers));
        assert!(!is_controller(non_controller, &controllers));
    }

    #[test]
    fn test_public_permission_allows_anyone() {
        let controllers = Controllers::new();
        let owner = test_principal(1);
        let caller = test_principal(2);

        assert!(assert_permission(
            &Permission::Public,
            owner,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_private_permission_allows_owner_not_controller() {
        let controllers = Controllers::new();
        let owner = test_principal(1);

        assert!(assert_permission(
            &Permission::Private,
            owner,
            owner,
            &controllers
        ));
    }

    #[test]
    fn test_private_permission_allows_owner_valid_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);

        controllers.insert(
            owner,
            create_controller(ControllerScope::Write, Some(mock_time() + 1000)),
        );

        assert!(assert_permission(
            &Permission::Private,
            owner,
            owner,
            &controllers
        ));
    }

    #[test]
    fn test_private_permission_rejects_owner_expired_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);

        controllers.insert(
            owner,
            create_controller(ControllerScope::Write, Some(mock_time() - 1)),
        );

        assert!(!assert_permission(
            &Permission::Private,
            owner,
            owner,
            &controllers
        ));
    }

    #[test]
    fn test_private_permission_rejects_non_owner() {
        let controllers = Controllers::new();
        let owner = test_principal(1);
        let caller = test_principal(2);

        assert!(!assert_permission(
            &Permission::Private,
            owner,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_managed_permission_allows_owner_not_controller() {
        let controllers = Controllers::new();
        let owner = test_principal(1);

        assert!(assert_permission(
            &Permission::Managed,
            owner,
            owner,
            &controllers
        ));
    }

    #[test]
    fn test_managed_permission_allows_owner_valid_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);

        controllers.insert(
            owner,
            create_controller(ControllerScope::Write, Some(mock_time() + 1000)),
        );

        assert!(assert_permission(
            &Permission::Managed,
            owner,
            owner,
            &controllers
        ));
    }

    #[test]
    fn test_managed_permission_rejects_owner_expired_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);

        controllers.insert(
            owner,
            create_controller(ControllerScope::Write, Some(mock_time() - 1)),
        );

        assert!(!assert_permission(
            &Permission::Managed,
            owner,
            owner,
            &controllers
        ));
    }

    #[test]
    fn test_managed_permission_allows_valid_write_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);
        let controller = test_principal(2);

        controllers.insert(
            controller,
            create_controller(ControllerScope::Write, Some(mock_time() + 1000)),
        );

        assert!(assert_permission(
            &Permission::Managed,
            owner,
            controller,
            &controllers
        ));
    }

    #[test]
    fn test_managed_permission_rejects_expired_write_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);
        let controller = test_principal(2);

        controllers.insert(
            controller,
            create_controller(ControllerScope::Write, Some(mock_time() - 1)),
        );

        assert!(!assert_permission(
            &Permission::Managed,
            owner,
            controller,
            &controllers
        ));
    }

    #[test]
    fn test_managed_permission_rejects_submit_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);
        let controller = test_principal(2);

        controllers.insert(controller, create_controller(ControllerScope::Submit, None));

        assert!(!assert_permission(
            &Permission::Managed,
            owner,
            controller,
            &controllers
        ));
    }

    #[test]
    fn test_controllers_permission_allows_valid_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);
        let controller = test_principal(2);

        controllers.insert(
            controller,
            create_controller(ControllerScope::Write, Some(mock_time() + 1000)),
        );

        assert!(assert_permission(
            &Permission::Controllers,
            owner,
            controller,
            &controllers
        ));
    }

    #[test]
    fn test_controllers_permission_rejects_expired_controller() {
        let mut controllers = Controllers::new();
        let owner = test_principal(1);
        let controller = test_principal(2);

        controllers.insert(
            controller,
            create_controller(ControllerScope::Write, Some(mock_time() - 1)),
        );

        assert!(!assert_permission(
            &Permission::Controllers,
            owner,
            controller,
            &controllers
        ));
    }

    // Create permission tests
    #[test]
    fn test_create_public_allows_anyone() {
        let controllers = Controllers::new();
        let caller = test_principal(1);

        assert!(assert_create_permission(
            &Permission::Public,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_create_private_allows_non_controller() {
        let controllers = Controllers::new();
        let caller = test_principal(1);

        assert!(assert_create_permission(
            &Permission::Private,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_create_private_allows_valid_controller() {
        let mut controllers = Controllers::new();
        let caller = test_principal(1);

        controllers.insert(
            caller,
            create_controller(ControllerScope::Write, Some(mock_time() + 1000)),
        );

        assert!(assert_create_permission(
            &Permission::Private,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_create_private_rejects_expired_controller() {
        let mut controllers = Controllers::new();
        let caller = test_principal(1);

        controllers.insert(
            caller,
            create_controller(ControllerScope::Write, Some(mock_time() - 1)),
        );

        assert!(!assert_create_permission(
            &Permission::Private,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_create_controllers_allows_valid_write_controller() {
        let mut controllers = Controllers::new();
        let caller = test_principal(1);

        controllers.insert(
            caller,
            create_controller(ControllerScope::Write, Some(mock_time() + 1000)),
        );

        assert!(assert_create_permission(
            &Permission::Controllers,
            caller,
            &controllers
        ));
    }

    #[test]
    fn test_create_controllers_rejects_submit_controller() {
        let mut controllers = Controllers::new();
        let caller = test_principal(1);

        controllers.insert(caller, create_controller(ControllerScope::Submit, None));

        assert!(!assert_create_permission(
            &Permission::Controllers,
            caller,
            &controllers
        ));
    }
}
