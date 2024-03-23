use crate::memory::STATE;
use crate::rules::constants::{DEFAULT_DB_LOG_RULE, LOG_COLLECTION_KEY};
use crate::rules::store::set_rule_db;

/// One time upgrade

pub fn init_log_collection() {
    let col = STATE.with(|state| {
        let rules = &state.borrow_mut().heap.db.rules;
        rules.get(LOG_COLLECTION_KEY).cloned()
    });

    if col.is_none() {
        // We are ignoring potential issues because we are processing during an upgrade, and it is not a functional blocker.
        // Serverless functions logging will not work, but that's not crucial enough to block the upgrade since we can address the issue through other means if necessary.
        let _ = set_rule_db(LOG_COLLECTION_KEY.to_string(), DEFAULT_DB_LOG_RULE);
    }
}
