use crate::types::rules::Permission;
use candid::Principal;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::{principal_not_anonymous, principal_not_anonymous_and_equal};

pub fn assert_permission(
    permission: &Permission,
    owner: Principal,
    caller: Principal,
    controllers: &Controllers,
) -> bool {
    match permission {
        Permission::Public => true,
        Permission::Private => assert_caller(caller, owner),
        Permission::Managed => assert_caller(caller, owner) || is_controller(caller, controllers),
        Permission::Controllers => is_controller(caller, controllers),
    }
}

/// If a document or asset is about to be created for the first time, it can be initialized without further rules unless the collection is set as controller and the caller is not a controller.
/// This can be useful e.g. when a collection read permission is set to public but only the administrator can add content.
pub fn assert_create_permission(
    permission: &Permission,
    caller: Principal,
    controllers: &Controllers,
) -> bool {
    match permission {
        Permission::Public => true,
        Permission::Private => assert_not_anonymous(caller),
        Permission::Managed => assert_not_anonymous(caller),
        Permission::Controllers => is_controller(caller, controllers),
    }
}

fn assert_caller(caller: Principal, owner: Principal) -> bool {
    principal_not_anonymous_and_equal(caller, owner)
}

fn assert_not_anonymous(caller: Principal) -> bool {
    principal_not_anonymous(caller)
}

pub fn public_permission(permission: &Permission) -> bool {
    matches!(permission, Permission::Public)
}
