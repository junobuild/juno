use crate::memory::STATE;
use ic_cdk::api::time;
use junobuild_collections::constants_db::{DEFAULT_USER_USAGE_RULE, USER_USAGE_COLLECTION_KEY};
use junobuild_collections::types::rules::Rule;

// ---------------------------------------------------------
// One time upgrade
// ---------------------------------------------------------

pub fn init_user_usage_collection() {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(USER_USAGE_COLLECTION_KEY).cloned()
    });

    if col.is_none() {
        STATE.with(|state| {
            let rules = &mut state.borrow_mut().heap.db.rules;

            let now = time();

            let rule = Rule {
                read: DEFAULT_USER_USAGE_RULE.read,
                write: DEFAULT_USER_USAGE_RULE.write,
                memory: DEFAULT_USER_USAGE_RULE.memory,
                mutable_permissions: DEFAULT_USER_USAGE_RULE.mutable_permissions,
                max_size: DEFAULT_USER_USAGE_RULE.max_size,
                max_capacity: DEFAULT_USER_USAGE_RULE.max_capacity,
                max_changes_per_user: DEFAULT_USER_USAGE_RULE.max_changes_per_user,
                created_at: now,
                updated_at: now,
                version: DEFAULT_USER_USAGE_RULE.version,
                rate_config: DEFAULT_USER_USAGE_RULE.rate_config,
            };

            rules.insert(USER_USAGE_COLLECTION_KEY.to_string(), rule.clone());
        });
    }
}
