use crate::db::types::state::DbHeapState;
use crate::rules::types::rules::{Memory, Rule, Rules};
use crate::storage::types::config::StorageConfig;
use crate::storage::types::state::StorageHeapState;
use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;
use std::collections::HashMap;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        let mut db_rules: Rules = HashMap::new();

        for (key, rule) in state.db.rules.iter() {
            db_rules.insert(
                key.clone(),
                Rule {
                    read: rule.read.clone(),
                    write: rule.write.clone(),
                    memory: Memory::Heap,
                    mutable_permissions: true,
                    max_size: rule.max_size,
                    created_at: rule.created_at,
                    updated_at: rule.updated_at,
                },
            );
        }

        let mut storage_rules: Rules = HashMap::new();

        for (key, rule) in state.storage.rules.iter() {
            storage_rules.insert(
                key.clone(),
                Rule {
                    read: rule.read.clone(),
                    write: rule.write.clone(),
                    memory: Memory::Heap,
                    mutable_permissions: true,
                    max_size: rule.max_size,
                    created_at: rule.created_at,
                    updated_at: rule.updated_at,
                },
            );
        }

        let config: StorageConfig = StorageConfig {
            headers: state.storage.config.headers.clone(),
            rewrites: state.storage.config.rewrites.clone(),
            redirects: HashMap::new(),
        };

        HeapState {
            controllers: state.controllers.clone(),
            db: DbHeapState {
                db: state.db.db.clone(),
                rules: db_rules,
            },
            storage: StorageHeapState {
                assets: state.storage.assets.clone(),
                rules: storage_rules,
                config,
                custom_domains: state.storage.custom_domains.clone(),
            },
        }
    }
}
