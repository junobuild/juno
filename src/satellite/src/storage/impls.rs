use crate::storage::certification::constants::{
    EXACT_MATCH_TERMINATOR, LABEL_ASSETS_V1, LABEL_ASSETS_V2,
};
use ic_cdk::api::time;
use ic_certified_map::{fork, fork_hash, labeled, labeled_hash, AsHashTree, Hash, HashTree};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use sha2::{Digest, Sha256};
use shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use std::borrow::Cow;
use std::cmp::Ordering;

use crate::storage::certification::tree_utils::nested_tree_key;
use crate::storage::constants::ENCODING_CERTIFICATION_ORDER;
use crate::storage::headers::build_asset_headers;
use crate::storage::types::assets::AssetHashes;
use crate::storage::types::http::HeaderField;
use crate::storage::types::interface::AssetNoContent;
use crate::storage::types::state::{FullPath, StableEncodingChunkKey, StableKey};
use crate::storage::types::store::{Asset, AssetEncoding};
use crate::storage::url::alternative_paths;
use crate::types::core::{Blob, Compare};

impl AssetHashes {
    /// Returns the root_hash of the asset certification tree.
    pub fn root_hash(&self) -> Hash {
        fork_hash(
            // NB: Labels added in lexicographic order.
            &labeled_hash(LABEL_ASSETS_V1, &self.tree_v1.root_hash()),
            &labeled_hash(LABEL_ASSETS_V2, &self.tree_v2.root_hash()),
        )
    }

    pub fn witness_v1(&self, path: &str) -> HashTree {
        let witness = self.tree_v1.witness(path.as_bytes());
        fork(
            labeled(LABEL_ASSETS_V1, witness),
            HashTree::Pruned(labeled_hash(LABEL_ASSETS_V2, &self.tree_v2.root_hash())),
        )
    }

    pub fn witness_v2(&self, absolute_path: &str) -> HashTree {
        assert!(absolute_path.starts_with('/'));

        let mut path: Vec<String> = absolute_path.split('/').map(str::to_string).collect();
        path.remove(0); // remove leading empty string due to absolute path
        path.push(EXACT_MATCH_TERMINATOR.to_string());
        let path_bytes: Vec<Blob> = path.iter().map(String::as_bytes).map(Vec::from).collect();
        let witness = self.tree_v2.witness(&path_bytes);

        fork(
            HashTree::Pruned(labeled_hash(LABEL_ASSETS_V1, &self.tree_v1.root_hash())),
            labeled(LABEL_ASSETS_V2, witness),
        )
    }

    pub(crate) fn insert(&mut self, asset: &Asset) {
        let full_path = asset.key.full_path.clone();

        for encoding_type in ENCODING_CERTIFICATION_ORDER.iter() {
            if let Some(encoding) = asset.encodings.get(*encoding_type) {
                self.insert_v1(&full_path, encoding.sha256);
                self.insert_v2(
                    &full_path,
                    &build_asset_headers(asset, encoding, &encoding_type.to_string()),
                    encoding.sha256,
                );

                return;
            }
        }
    }

    fn insert_v1(&mut self, full_path: &FullPath, sha256: Hash) {
        self.tree_v1.insert(full_path.clone(), sha256);

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v1.insert(alt_path, sha256);
                }
            }
        }
    }

    fn insert_v2(&mut self, full_path: &FullPath, headers: &[HeaderField], sha256: Hash) {
        self.tree_v2
            .insert(&nested_tree_key(full_path, headers, sha256), vec![]);

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v2
                        .insert(&nested_tree_key(&alt_path, headers, sha256), vec![]);
                }
            }
        }
    }

    pub(crate) fn delete(&mut self, asset: &Asset) {
        let full_path = asset.key.full_path.clone();

        for encoding_type in ENCODING_CERTIFICATION_ORDER.iter() {
            if let Some(encoding) = asset.encodings.get(*encoding_type) {
                self.delete_v1(&full_path);
                self.delete_v2(
                    &full_path,
                    &build_asset_headers(asset, encoding, &encoding_type.to_string()),
                    encoding.sha256,
                );

                return;
            }
        }
    }

    fn delete_v1(&mut self, full_path: &String) {
        self.tree_v1.delete(full_path.clone().as_bytes());

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v1.delete(alt_path.as_bytes());
                }
            }
        }
    }

    fn delete_v2(&mut self, full_path: &FullPath, headers: &[HeaderField], sha256: Hash) {
        self.tree_v2
            .delete(&nested_tree_key(full_path, headers, sha256));

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v2
                        .delete(&nested_tree_key(&alt_path, headers, sha256));
                }
            }
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

impl Compare for AssetNoContent {
    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
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

impl Storable for StableKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for StableEncodingChunkKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}
