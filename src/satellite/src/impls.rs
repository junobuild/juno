use crate::db::types::state::DbHeapState;
use crate::memory::init_stable_state;
use crate::rules::constants::{DEFAULT_ASSETS_COLLECTIONS, DEFAULT_DB_COLLECTIONS};
use crate::rules::types::rules::Rule;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::state::StorageHeapState;
use crate::types::list::ListOrderField;
use crate::types::state::{HeapState, RuntimeState, State};
use ic_cdk::api::time;
use shared::types::state::Controllers;
use std::collections::{BTreeMap, HashMap};

impl Default for ListOrderField {
    fn default() -> Self {
        ListOrderField::Keys
    }
}

impl Default for State {
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
                        max_size: rule.max_size,
                        created_at: now,
                        updated_at: now,
                    },
                )
            })),
        };

        let storage: StorageHeapState = StorageHeapState {
            assets: HashMap::new(),
            rules: HashMap::from(DEFAULT_ASSETS_COLLECTIONS.map(|(collection, rule)| {
                (
                    collection.to_owned(),
                    Rule {
                        read: rule.read,
                        write: rule.write,
                        max_size: rule.max_size,
                        created_at: now,
                        updated_at: now,
                    },
                )
            })),
            config: StorageConfig::default(),
            custom_domains: HashMap::new(),
        };

        Self {
            stable: init_stable_state(),
            heap: HeapState {
                controllers: Controllers::default(),
                db,
                storage,
            },
            runtime: RuntimeState::default(),
        }
    }
}
