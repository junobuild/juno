use crate::http::types::HeaderField;
use crate::types::config::{
    StorageConfig, StorageConfigHeaders, StorageConfigIFrame, StorageConfigRawAccess,
    StorageConfigRedirects, StorageConfigRewrites,
};
use crate::types::interface::{AssetEncodingNoContent, AssetNoContent};
use crate::types::state::StorageHeapState;
use crate::types::store::{Asset, AssetEncoding, AssetKey, Batch, BatchExpiry};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::{Memory, Rule, Rules};
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::core::{Blob, Hash, Hashable};
use junobuild_shared::types::state::Timestamp;
use junobuild_shared::types::state::Timestamped;
use sha2::{Digest, Sha256};
use std::borrow::Cow;
use std::cmp::Ordering;
use std::collections::HashMap;

impl Default for StorageHeapState {
    fn default() -> Self {
        Self::new_with_storage_collections(Vec::from(DEFAULT_ASSETS_COLLECTIONS))
    }
}

impl StorageHeapState {
    pub fn new_with_storage_collections(storage_collections: Vec<(&str, SetRule)>) -> Self {
        let now = time();

        StorageHeapState {
            assets: HashMap::new(),
            rules: storage_collections
                .into_iter()
                .map(|(collection, rule)| {
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
                            version: rule.version,
                            rate_config: rule.rate_config,
                        },
                    )
                })
                .collect::<Rules>(),
            config: StorageConfig {
                headers: StorageConfigHeaders::default(),
                rewrites: StorageConfigRewrites::default(),
                redirects: Some(StorageConfigRedirects::default()),
                iframe: None,
                raw_access: None,
                max_memory_size: None,
            },
            custom_domains: HashMap::new(),
        }
    }
}

impl From<&Vec<Blob>> for AssetEncoding {
    fn from(content_chunks: &Vec<Blob>) -> Self {
        let mut total_length: u128 = 0;
        let mut hasher = Sha256::new();

        // Calculate sha256 and total length
        for chunk in content_chunks.iter() {
            total_length += u128::try_from(chunk.len()).unwrap();

            hasher.update(chunk);
        }

        let sha256 = hasher.finalize().into();

        AssetEncoding {
            modified: time(),
            content_chunks: content_chunks.clone(),
            total_length,
            sha256,
        }
    }
}

impl StorageConfig {
    pub fn unwrap_redirects(&self) -> StorageConfigRedirects {
        self.redirects.clone().unwrap_or_default()
    }

    pub fn unwrap_iframe(&self) -> StorageConfigIFrame {
        self.iframe.clone().unwrap_or(StorageConfigIFrame::Deny)
    }

    pub fn unwrap_raw_access(&self) -> StorageConfigRawAccess {
        self.raw_access
            .clone()
            .unwrap_or(StorageConfigRawAccess::Deny)
    }
}

impl Timestamped for AssetNoContent {
    fn created_at(&self) -> Timestamp {
        self.created_at
    }

    fn updated_at(&self) -> Timestamp {
        self.updated_at
    }

    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
    }
}

impl From<&Asset> for AssetNoContent {
    fn from(asset: &Asset) -> Self {
        AssetNoContent {
            key: asset.key.clone(),
            headers: asset.headers.clone(),
            encodings: asset
                .encodings
                .clone()
                .into_iter()
                .map(|(key, encoding)| {
                    (
                        key,
                        AssetEncodingNoContent {
                            modified: encoding.modified,
                            total_length: encoding.total_length,
                            sha256: encoding.sha256,
                        },
                    )
                })
                .collect(),
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            version: asset.version,
        }
    }
}

impl Storable for Asset {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Timestamped for Asset {
    fn created_at(&self) -> Timestamp {
        self.created_at
    }

    fn updated_at(&self) -> Timestamp {
        self.updated_at
    }

    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
    }
}

impl BatchExpiry for Batch {
    fn expires_at(&self) -> Timestamp {
        self.expires_at
    }
}

impl Hashable for AssetKey {
    fn hash(&self) -> Hash {
        let mut hasher = Sha256::new();
        hasher.update(self.name.as_bytes());
        hasher.update(self.full_path.as_bytes());
        if let Some(token) = &self.token {
            hasher.update(token.as_bytes());
        }
        hasher.update(self.collection.as_bytes());
        hasher.update(serialize_to_bytes(&self.owner));
        if let Some(description) = &self.description {
            hasher.update(description.as_bytes());
        }
        hasher.finalize().into()
    }
}

impl Hashable for Asset {
    fn hash(&self) -> Hash {
        let mut hasher = Sha256::new();
        hasher.update(self.key.hash());
        for HeaderField(ref key, ref value) in &self.headers {
            hasher.update(key.as_bytes());
            hasher.update(value.as_bytes());
        }
        hasher.update(self.created_at.to_le_bytes());
        hasher.update(self.updated_at.to_le_bytes());
        if let Some(version) = self.version {
            hasher.update(version.to_le_bytes());
        }
        hasher.finalize().into()
    }
}

impl Hashable for AssetEncoding {
    fn hash(&self) -> Hash {
        let mut hasher = Sha256::new();
        hasher.update(self.modified.to_le_bytes());
        hasher.update(self.total_length.to_le_bytes());
        hasher.update(self.sha256);
        hasher.finalize().into()
    }
}
