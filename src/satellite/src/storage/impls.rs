use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use sha2::{Digest, Sha256};
use shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use std::borrow::Cow;
use std::cmp::Ordering;

use crate::storage::constants::ENCODING_CERTIFICATION_ORDER;
use crate::storage::types::assets::AssetHashes;
use crate::storage::types::interface::AssetNoContent;
use crate::storage::types::state::{StableEncodingChunkKey, StableKey};
use crate::storage::types::store::{Asset, AssetEncoding};
use crate::storage::url::alternative_paths;
use crate::types::core::{Blob, Compare};

impl AssetHashes {
    pub(crate) fn insert(&mut self, asset: &Asset) {
        let full_path = asset.key.full_path.clone();

        for encoding_type in ENCODING_CERTIFICATION_ORDER.iter() {
            if let Some(encoding) = asset.encodings.get(*encoding_type) {
                self.tree.insert(full_path.clone(), encoding.sha256);

                let alt_paths = alternative_paths(&full_path);

                match alt_paths {
                    None => (),
                    Some(alt_paths) => {
                        for alt_path in alt_paths {
                            self.tree.insert(alt_path, encoding.sha256);
                        }
                    }
                }

                return;
            }
        }
    }

    pub(crate) fn delete(&mut self, full_path: &String) {
        self.tree.delete(full_path.clone().as_bytes());

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree.delete(alt_path.as_bytes());
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
