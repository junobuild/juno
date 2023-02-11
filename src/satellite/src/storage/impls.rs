use ic_cdk::api::time;
use sha2::{Digest, Sha256};

use crate::storage::constants::ENCODING_CERTIFICATION_ORDER;
use crate::storage::types::assets::AssetHashes;
use crate::storage::types::state::StorageStableState;
use crate::storage::types::store::{Asset, AssetEncoding};
use crate::storage::url::alternative_paths;

impl From<&StorageStableState> for AssetHashes {
    fn from(state: &StorageStableState) -> Self {
        let mut asset_hashes = Self::default();

        for (_key, asset) in state.assets.iter() {
            asset_hashes.insert(asset);
        }

        asset_hashes
    }
}

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

impl From<&Vec<Vec<u8>>> for AssetEncoding {
    fn from(content_chunks: &Vec<Vec<u8>>) -> Self {
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
