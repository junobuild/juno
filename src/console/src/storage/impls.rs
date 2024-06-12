use crate::storage::types::state::{BatchStableEncodingChunkKey, BatchStableKey, StorageHeapState};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_storage::types::config::{
    StorageConfig, StorageConfigHeaders, StorageConfigRedirects, StorageConfigRewrites,
};
use std::borrow::Cow;
use std::collections::HashMap;

// TODO: basically same as in satellite
impl Default for StorageHeapState {
    fn default() -> Self {
        let now = 0; // Replace with actual timestamp logic
        StorageHeapState {
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
                        max_capacity: rule.max_capacity,
                        created_at: now,
                        updated_at: now,
                        version: None,
                    },
                )
            })),
            config: StorageConfig {
                headers: StorageConfigHeaders::default(),
                rewrites: StorageConfigRewrites::default(),
                redirects: Some(StorageConfigRedirects::default()),
                iframe: None,
                raw_access: None,
            },
            // TODO: custom domains
            // custom_domains: HashMap::new(),
        }
    }
}

impl Storable for BatchStableKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for BatchStableEncodingChunkKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}
