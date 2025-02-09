use crate::memory::STATE;
use crate::rules::store::set_rule_db;
use junobuild_collections::constants::{
    DEFAULT_USER_USAGE_RULE, USER_USAGE_COLLECTION_KEY,
};

/// One time upgrade

pub fn init_user_usage_collections() {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(USER_USAGE_COLLECTION_KEY).cloned()
    });

    if col.is_none() {
        // We are ignoring potential issues because we are processing during an upgrade.
        let _ = set_rule_db(
            USER_USAGE_COLLECTION_KEY.to_string(),
            DEFAULT_USER_USAGE_RULE,
        );
    }
}
