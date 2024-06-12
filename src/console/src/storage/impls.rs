use crate::storage::types::state::StorageHeapState;
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_storage::types::config::{
    StorageConfig, StorageConfigHeaders, StorageConfigRedirects, StorageConfigRewrites,
};
use std::collections::HashMap;

impl Default for StorageHeapState {
    fn default() -> Self {
        let now = 0; // Replace with actual timestamp logic
        StorageHeapState {
            assets: HashMap::new(),
            rules: HashMap::from(
                DEFAULT_ASSETS_COLLECTIONS
                    .map(|(collection, rule)| {
                        (
                            collection.to_owned(),
                            Rule {
                                read: rule.read,
                                write: rule.write,
                                memory: Some(rule.memory.unwrap_or(Memory::Heap)),
                                mutable_permissions: Some(
                                    rule.mutable_permissions.unwrap_or(false),
                                ),
                                max_size: rule.max_size,
                                max_capacity: rule.max_capacity,
                                created_at: now,
                                updated_at: now,
                                version: None,
                            },
                        )
                    })
                    .collect(),
            ),
            config: StorageConfig {
                headers: StorageConfigHeaders::default(),
                rewrites: StorageConfigRewrites::default(),
                redirects: Some(StorageConfigRedirects::default()),
                iframe: None,
                raw_access: None,
            },
            // TODO: custom_domains
            // custom_domains: HashMap::new(),
        }
    }
}
