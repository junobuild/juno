use crate::db::types::state::DbHeapState;
use crate::memory::init_stable_state;
use crate::types::state::{HeapState, RuntimeState, State};
use ic_cdk::api::time;
use junobuild_collections::constants::DEFAULT_DB_COLLECTIONS;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::state::Controllers;
use junobuild_storage::types::state::StorageHeapState;
use std::collections::{BTreeMap, HashMap};

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
            runtime: RuntimeState::default(),
        }
    }
}

impl Default for HeapState {
    fn default() -> Self {
        let now = time();

        let db: DbHeapState = DbHeapState {
            db: HashMap::from(
                DEFAULT_DB_COLLECTIONS
                    .map(|(collection, _rules)| (collection.to_owned(), BTreeMap::new())),
            ),
            rules: HashMap::from(DEFAULT_DB_COLLECTIONS.map(|(collection, rule)| {
                (
                    collection.to_owned(),
                    Rule {
                        read: rule.read,
                        write: rule.write,
                        memory: Some(rule.memory.unwrap_or(Memory::Stable)),
                        mutable_permissions: Some(rule.mutable_permissions.unwrap_or(false)),
                        max_size: rule.max_size,
                        max_capacity: rule.max_capacity,
                        created_at: now,
                        updated_at: now,
                        version: None,
                    },
                )
            })),
            config: None,
        };

        Self {
            controllers: Controllers::default(),
            db,
            storage: StorageHeapState::default(),
            authentication: None,
        }
    }
}
