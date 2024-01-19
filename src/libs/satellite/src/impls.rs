use crate::db::types::state::DbHeapState;
use crate::memory::init_stable_state;
use crate::rules::constants::{DEFAULT_ASSETS_COLLECTIONS, DEFAULT_DB_COLLECTIONS};
use crate::rules::types::rules::{Memory, Rule};
use crate::storage::types::config::{
    StorageConfig, StorageConfigHeaders, StorageConfigRedirects, StorageConfigRewrites,
};
use crate::storage::types::state::StorageHeapState;
use crate::types::state::{HeapState, RuntimeState, State};
use ic_cdk::api::time;
use shared::types::state::Controllers;
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
                        memory: Some(rule.memory.unwrap_or(Memory::Heap)),
                        mutable_permissions: Some(rule.mutable_permissions.unwrap_or(false)),
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
                        memory: Some(rule.memory.unwrap_or(Memory::Heap)),
                        mutable_permissions: Some(rule.mutable_permissions.unwrap_or(false)),
                        max_size: rule.max_size,
                        created_at: now,
                        updated_at: now,
                    },
                )
            })),
            config: StorageConfig {
                headers: StorageConfigHeaders::default(),
                rewrites: StorageConfigRewrites::default(),
                redirects: Some(StorageConfigRedirects::default()),
                iframe: None,
            },
            custom_domains: HashMap::new(),
        };

        Self {
            controllers: Controllers::default(),
            db,
            storage,
        }
    }
}
