use crate::types::config::{
    StorageConfig, StorageConfigHeaders, StorageConfigIFrame, StorageConfigRawAccess,
    StorageConfigRedirects, StorageConfigRewrites,
};
use crate::types::interface::{AssetEncodingNoContent, AssetNoContent};
use crate::types::state::StorageHeapState;
use crate::types::store::{Asset, AssetEncoding};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::core::{Blob, Compare};
use sha2::{Digest, Sha256};
use std::borrow::Cow;
use std::cmp::Ordering;
use std::collections::HashMap;

impl Default for StorageHeapState {
    fn default() -> Self {
        let now = time();

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

impl Compare for AssetNoContent {
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

impl Compare for Asset {
    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
    }
}
