use ic_cdk::api::time;
use junobuild_collections::constants::db::{COLLECTION_AUTOMATION_TOKEN_KEY, COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE, COLLECTION_AUTOMATION_WORKFLOW_KEY, COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE};
use junobuild_collections::types::rules::Rule;
use crate::memory::state::STATE;

// ---------------------------------------------------------
// One time upgrade
// ---------------------------------------------------------

pub fn init_automation_collections() {
    init_automation_token_collection();
    init_automation_workflow_collection();
}

fn init_automation_token_collection() {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(COLLECTION_AUTOMATION_TOKEN_KEY).cloned()
    });

    if col.is_none() {
        STATE.with(|state| {
            let rules = &mut state.borrow_mut().heap.db.rules;

            let now = time();

            let rule = Rule {
                read: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.read,
                write: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.write,
                memory: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.memory,
                mutable_permissions: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.mutable_permissions,
                max_size: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.max_size,
                max_capacity: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.max_capacity,
                max_changes_per_user: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.max_changes_per_user,
                created_at: now,
                updated_at: now,
                version: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.version,
                rate_config: COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE.rate_config,
            };

            rules.insert(COLLECTION_AUTOMATION_TOKEN_KEY.to_string(), rule.clone());
        });
    }
}

fn init_automation_workflow_collection() {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(COLLECTION_AUTOMATION_WORKFLOW_KEY).cloned()
    });

    if col.is_none() {
        STATE.with(|state| {
            let rules = &mut state.borrow_mut().heap.db.rules;

            let now = time();

            let rule = Rule {
                read: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.read,
                write: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.write,
                memory: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.memory,
                mutable_permissions: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE
                    .mutable_permissions,
                max_size: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.max_size,
                max_capacity: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.max_capacity,
                max_changes_per_user: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE
                    .max_changes_per_user,
                created_at: now,
                updated_at: now,
                version: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.version,
                rate_config: COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE.rate_config,
            };

            rules.insert(COLLECTION_AUTOMATION_WORKFLOW_KEY.to_string(), rule.clone());
        });
    }
}
