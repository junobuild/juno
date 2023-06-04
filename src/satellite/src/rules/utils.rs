use crate::memory::STATE;
use crate::rules::constants::DEFAULT_DB_COLLECTIONS;
use crate::rules::types::rules::Permission;
use candid::Principal;
use shared::controllers::is_controller;
use shared::types::state::Controllers;
use shared::utils::principal_equal;

pub fn assert_rule(
    rule: &Permission,
    owner: Principal,
    caller: Principal,
    controllers: &Controllers,
) -> bool {
    match rule {
        Permission::Public => true,
        Permission::Private => principal_equal(owner, caller),
        Permission::Managed => principal_equal(owner, caller) || is_controller(caller, controllers),
        Permission::Controllers => is_controller(caller, controllers),
    }
}

/// If a document or asset is about to be created for the first time, it can be initialized without further rules unless the collection is set as controller and the caller is not a controller.
/// This can be useful e.g. when a collection read permission is set to public but only the administrator can add content.
pub fn assert_create_rule(rule: &Permission, caller: Principal, controllers: &Controllers) -> bool {
    match rule {
        Permission::Public => true,
        Permission::Private => true,
        Permission::Managed => true,
        Permission::Controllers => is_controller(caller, controllers),
    }
}

pub fn public_rule(rule: &Permission) -> bool {
    matches!(rule, Permission::Public)
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
