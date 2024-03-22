use crate::memory::STATE;
use crate::rules::constants::LOG_COLLECTION_KEY;
use crate::rules::store::set_rule_db;
use crate::rules::types::interface::SetRule;
use crate::rules::types::rules::{Memory};
use crate::rules::types::rules::Permission::Controllers;

/// One time upgrade

pub fn init_log_collection() {
    STATE.with(|state| {
        let rules = &mut state.borrow_mut().heap.db.rules;

        let col = rules.get(LOG_COLLECTION_KEY);

        if col.is_none() {
            let rule: SetRule = SetRule {
                read: Controllers,
                write: Controllers,
                memory: Some(Memory::Stable),
                mutable_permissions: Some(false),
                max_size: None,
                max_capacity: Some(100),
                updated_at: None,
            };

            // We are ignoring potential issues because we are processing during an upgrade, and it is not a functional blocker.
            // Serverless functions logging will not work, but that's not crucial enough to block the upgrade since we can address the issue through other means if necessary.
            let _ = set_rule_db(LOG_COLLECTION_KEY.to_string(), rule);
        }
    })
}