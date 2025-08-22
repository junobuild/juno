use ic_cdk::api::time;
use junobuild_collections::constants::db::{COLLECTION_USER_WEBAUTHN_DEFAULT_RULE, COLLECTION_USER_WEBAUTHN_KEY};
use junobuild_collections::types::rules::{Rule};
use crate::memory::internal::STATE;

// ---------------------------------------------------------
// One time upgrade
// ---------------------------------------------------------

pub fn init_user_passkey_collection() {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(COLLECTION_USER_WEBAUTHN_KEY).cloned()
    });

    if col.is_none() {
        STATE.with(|state| {
            let rules = &mut state.borrow_mut().heap.db.rules;

            let now = time();

            let rule = Rule {
                read: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.read,
                write: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.write,
                memory: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.memory,
                mutable_permissions: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.mutable_permissions,
                max_size: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.max_size,
                max_capacity: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.max_capacity,
                max_changes_per_user: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.max_changes_per_user,
                created_at: now,
                updated_at: now,
                version: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.version,
                rate_config: COLLECTION_USER_WEBAUTHN_DEFAULT_RULE.rate_config,
            };

            rules.insert(COLLECTION_USER_WEBAUTHN_KEY.to_string(), rule.clone());
        });
    }
}