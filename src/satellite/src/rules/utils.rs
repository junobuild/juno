use crate::db::types::state::Db;
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

pub fn public_rule(rule: &Permission) -> bool {
    matches!(rule, Permission::Public)
}

pub fn is_known_user(caller: Principal, db: &Db) -> bool {
    // #user collection cannot be deleted
    db.get(DEFAULT_DB_COLLECTIONS[0].0)
        .unwrap()
        .contains_key(&caller.to_text())
}
