use crate::db::types::state::DbHeapState;
use crate::rules::types::rules::{Memory, Rule, Rules};
use crate::storage::types::state::StorageHeapState;
use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;
use std::collections::HashMap;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        let mut rules: Rules = HashMap::new();

        for (key, rule) in state.db.rules.iter() {
            rules.insert(
                key.clone(),
                Rule {
                    read: rule.read.clone(),
                    write: rule.write.clone(),
                    memory: Memory::Heap,
                    max_size: rule.max_size,
                    created_at: rule.created_at,
                    updated_at: rule.updated_at,
                },
            );
        }

        HeapState {
            controllers: state.controllers.clone(),
            db: DbHeapState {
                db: state.db.db.clone(),
                rules,
            },
            storage: StorageHeapState {
                assets: state.storage.assets.clone(),
                rules: state.storage.rules.clone(),
                config: state.storage.config.clone(),
                custom_domains: state.storage.custom_domains.clone(),
            },
        }
    }
}
