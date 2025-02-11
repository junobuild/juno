use crate::memory::STATE;
use ic_cdk::api::time;
use junobuild_collections::constants::db::{
    COLLECTION_USER_ADMIN_DEFAULT_RULE, COLLECTION_USER_ADMIN_KEY,
    COLLECTION_USER_USAGE_DEFAULT_RULE, COLLECTION_USER_USAGE_KEY,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::Rule;

// ---------------------------------------------------------
// One time upgrade
// ---------------------------------------------------------

pub fn init_new_user_collections() {
    init_collection(
        &COLLECTION_USER_USAGE_KEY.to_string(),
        COLLECTION_USER_USAGE_DEFAULT_RULE,
    );
    init_collection(
        &COLLECTION_USER_ADMIN_KEY.to_string(),
        COLLECTION_USER_ADMIN_DEFAULT_RULE,
    );
}

fn init_collection(collection: &CollectionKey, default_rule: SetRule) {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(collection).cloned()
    });

    if col.is_none() {
        STATE.with(|state| {
            let rules = &mut state.borrow_mut().heap.db.rules;

            let now = time();

            let rule = Rule {
                read: default_rule.read,
                write: default_rule.write,
                memory: default_rule.memory,
                mutable_permissions: default_rule.mutable_permissions,
                max_size: default_rule.max_size,
                max_capacity: default_rule.max_capacity,
                max_changes_per_user: default_rule.max_changes_per_user,
                created_at: now,
                updated_at: now,
                version: default_rule.version,
                rate_config: default_rule.rate_config,
            };

            rules.insert(collection.to_string(), rule.clone());
        });
    }
}
