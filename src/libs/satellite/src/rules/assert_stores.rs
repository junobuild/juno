use crate::memory::STATE;
use crate::rules::constants::DEFAULT_DB_COLLECTIONS;
use crate::rules::types::rules::Permission;
use candid::Principal;
use shared::controllers::is_controller;
use shared::types::state::Controllers;
use shared::utils::{principal_equal, principal_not_anonymous};

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
    assert_not_anonymous(caller) && principal_equal(owner, caller)
}

fn assert_not_anonymous(caller: Principal) -> bool {
    principal_not_anonymous(caller)
}

pub fn public_permission(permission: &Permission) -> bool {
    matches!(permission, Permission::Public)
}

pub fn is_known_user(caller: Principal) -> bool {
    // #user collection cannot be deleted
    STATE.with(|state| {
        state
            .borrow()
            .heap
            .db
            .db
            .get(DEFAULT_DB_COLLECTIONS[0].0)
            .unwrap()
            .contains_key(&caller.to_text())
    })
}
