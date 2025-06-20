use crate::certification::constants::{
    EXACT_MATCH_TERMINATOR, LABEL_ASSETS_V1, LABEL_ASSETS_V2, WILDCARD_MATCH_TERMINATOR,
};
use crate::certification::tree_utils::{
    fallback_paths, nested_tree_expr_path, nested_tree_key, nested_tree_path,
};
use crate::certification::types::certified::CertifiedAssetHashes;
use crate::constants::{
    ENCODING_CERTIFICATION_ORDER, RESPONSE_STATUS_CODE_200, RESPONSE_STATUS_CODE_404,
    ROOT_404_HTML, ROOT_INDEX_HTML, ROOT_PATH,
};
use crate::http::headers::{build_headers, build_redirect_headers};
use crate::http::types::{HeaderField, StatusCode};
use crate::types::config::{StorageConfig, StorageConfigIFrame};
use crate::types::state::FullPath;
use crate::types::store::Asset;
use crate::url::alternative_paths;
use ic_certification::{
    fork, fork_hash, labeled, labeled_hash, merge_hash_trees, pruned, AsHashTree, Hash, HashTree,
};
use sha2::{Digest, Sha256};

impl CertifiedAssetHashes {
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
            pruned(labeled_hash(LABEL_ASSETS_V2, &self.tree_v2.root_hash())),
        )
    }

    pub fn witness_v2(&self, absolute_path: &str) -> HashTree {
        assert!(absolute_path.starts_with('/'));

        let segments = nested_tree_path(absolute_path, EXACT_MATCH_TERMINATOR);
        let witness = self.tree_v2.witness(&segments);

        fork(
            pruned(labeled_hash(LABEL_ASSETS_V1, &self.tree_v1.root_hash())),
            labeled(LABEL_ASSETS_V2, witness),
        )
    }

    pub fn witness_rewrite_v2(&self, absolute_path: &str) -> HashTree {
        assert!(absolute_path.starts_with('/'));

        // Witness incorrect url: e.g. /1234
        let segments = nested_tree_path(absolute_path, EXACT_MATCH_TERMINATOR);
        let absence_proof = self.tree_v2.witness(&segments);

        // Fallback to search for non conflicting rewrites starting the search from root
        let fallback_paths = fallback_paths(segments.clone());

        // Witness fallback paths with the absence of proof to validate it can be rewritten
        let combined_proof = fallback_paths
            .into_iter()
            .fold(absence_proof, |accumulator, path| {
                let new_proof = self.tree_v2.witness(&[path]);
                merge_hash_trees(accumulator, new_proof)
            });

        fork(
            pruned(labeled_hash(LABEL_ASSETS_V1, &self.tree_v1.root_hash())),
            labeled(LABEL_ASSETS_V2, combined_proof),
        )
    }

    pub fn expr_path_v2(
        &self,
        absolute_path: &str,
        rewrite_source: &Option<String>,
    ) -> Vec<String> {
        match rewrite_source {
            None => nested_tree_expr_path(absolute_path, EXACT_MATCH_TERMINATOR),
            Some(rewrite_source) => {
                nested_tree_expr_path(rewrite_source, WILDCARD_MATCH_TERMINATOR)
            }
        }
    }

    pub fn insert(&mut self, asset: &Asset, config: &StorageConfig) {
        let full_path = asset.key.full_path.clone();

        self.insert_most_important_v1(asset, &full_path);
        self.insert_all_v2(asset, &full_path, config);
    }

    // In v1, only the most important encoding is certified.
    fn insert_most_important_v1(&mut self, asset: &Asset, full_path: &FullPath) {
        for encoding_type in ENCODING_CERTIFICATION_ORDER.iter().rev() {
            if let Some(encoding) = asset.encodings.get(*encoding_type) {
                self.insert_v1(full_path, encoding.sha256);
                return;
            }
        }
    }

    // In v2, all encoding must be certified.
    fn insert_all_v2(&mut self, asset: &Asset, full_path: &FullPath, config: &StorageConfig) {
        for (encoding_type, encoding) in &asset.encodings {
            self.insert_v2(
                full_path,
                &build_headers(asset, encoding, encoding_type, config),
                RESPONSE_STATUS_CODE_200,
                encoding.sha256,
            );
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

    fn insert_v2(
        &mut self,
        full_path: &FullPath,
        headers: &[HeaderField],
        status_code: StatusCode,
        sha256: Hash,
    ) {
        self.tree_v2.insert(
            &nested_tree_key(
                full_path,
                headers,
                sha256,
                EXACT_MATCH_TERMINATOR,
                status_code,
            ),
            vec![],
        );

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v2.insert(
                        &nested_tree_key(
                            &alt_path,
                            headers,
                            sha256,
                            EXACT_MATCH_TERMINATOR,
                            RESPONSE_STATUS_CODE_200,
                        ),
                        vec![],
                    );
                }
            }
        }

        // Rewrite ** to /
        if *full_path == *ROOT_INDEX_HTML {
            let has_404 = self
                .tree_v2
                .contains_path(&nested_tree_path(ROOT_404_HTML, WILDCARD_MATCH_TERMINATOR));

            if !has_404 {
                self.insert_rewrite_into_tree_v2(
                    &ROOT_PATH.to_string(),
                    headers,
                    sha256,
                    RESPONSE_STATUS_CODE_200,
                );
            }
        }

        // Rewrite ** to /404
        if *full_path == *ROOT_404_HTML {
            let index_tree_path = nested_tree_path(ROOT_INDEX_HTML, WILDCARD_MATCH_TERMINATOR);

            let has_index = self.tree_v2.contains_path(&index_tree_path);

            if has_index {
                // Delete existing rewrite to root with /index.html in the tree to enter the new rewrite to /404.html
                self.delete_from_tree_v2(&ROOT_PATH.to_string(), WILDCARD_MATCH_TERMINATOR);
            }

            self.insert_rewrite_into_tree_v2(
                &ROOT_PATH.to_string(),
                headers,
                sha256,
                RESPONSE_STATUS_CODE_404,
            );
        }
    }

    pub fn insert_redirect_v2(
        &mut self,
        full_path: &FullPath,
        status_code: StatusCode,
        location: &str,
        iframe: &StorageConfigIFrame,
    ) {
        let headers = build_redirect_headers(location, iframe);

        let sha256 = Sha256::digest(Vec::new().clone()).into();

        self.insert_v2(full_path, &headers, status_code, sha256);
    }

    pub fn insert_rewrite_v2(
        &mut self,
        full_path: &FullPath,
        asset: &Asset,
        config: &StorageConfig,
    ) {
        for encoding_type in ENCODING_CERTIFICATION_ORDER.iter().rev() {
            if let Some(encoding) = asset.encodings.get(*encoding_type) {
                self.insert_rewrite_into_tree_v2(
                    full_path,
                    &build_headers(asset, encoding, &encoding_type.to_string(), config),
                    encoding.sha256,
                    RESPONSE_STATUS_CODE_200,
                );

                return;
            }
        }
    }

    fn insert_rewrite_into_tree_v2(
        &mut self,
        full_path: &FullPath,
        headers: &[HeaderField],
        sha256: Hash,
        status_code: StatusCode,
    ) {
        self.tree_v2.insert(
            &nested_tree_key(
                full_path,
                headers,
                sha256,
                WILDCARD_MATCH_TERMINATOR,
                status_code,
            ),
            vec![],
        );
    }

    pub fn delete(&mut self, asset: &Asset) {
        let full_path = asset.key.full_path.clone();

        self.delete_v1(&full_path);
        self.delete_v2(&full_path);
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

    fn delete_v2(&mut self, full_path: &FullPath) {
        self.delete_from_tree_v2(full_path, EXACT_MATCH_TERMINATOR);

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.delete_from_tree_v2(&alt_path, EXACT_MATCH_TERMINATOR);
                }
            }
        }

        // Delete rewrite ** to /404
        if *full_path == *ROOT_404_HTML {
            self.delete_from_tree_v2(&ROOT_PATH.to_string(), WILDCARD_MATCH_TERMINATOR);
        }

        // Delete rewrite ** to /
        if *full_path == *ROOT_INDEX_HTML {
            let has_404 = self
                .tree_v2
                .contains_path(&nested_tree_path(ROOT_404_HTML, WILDCARD_MATCH_TERMINATOR));

            if !has_404 {
                self.delete_from_tree_v2(&ROOT_PATH.to_string(), WILDCARD_MATCH_TERMINATOR);
            }
        }
    }

    fn delete_from_tree_v2(&mut self, full_path: &FullPath, terminator: &str) {
        self.tree_v2
            .delete(&nested_tree_path(full_path, terminator));
    }
}
