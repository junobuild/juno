use crate::storage::certification::constants::{
    EXACT_MATCH_TERMINATOR, LABEL_ASSETS_V1, LABEL_ASSETS_V2, LABEL_HTTP_EXPR,
    WILDCARD_MATCH_TERMINATOR,
};
use crate::storage::certification::tree::merge_hash_trees;
use crate::storage::certification::tree_utils::{
    nested_tree_key, nested_tree_path,
};
use crate::storage::certification::types::certified::CertifiedAssetHashes;
use crate::storage::constants::ENCODING_CERTIFICATION_ORDER;
use crate::storage::http::headers::build_asset_headers;
use crate::storage::types::http::HeaderField;
use crate::storage::types::state::FullPath;
use crate::storage::types::store::Asset;
use crate::storage::url::alternative_paths;
use ic_certified_map::{fork, fork_hash, labeled, labeled_hash, AsHashTree, Hash, HashTree};

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
            HashTree::Pruned(labeled_hash(LABEL_ASSETS_V2, &self.tree_v2.root_hash())),
        )
    }

    pub fn witness_v2(&self, absolute_path: &str) -> HashTree {
        assert!(absolute_path.starts_with('/'));

        let segments = nested_tree_path(absolute_path, EXACT_MATCH_TERMINATOR);
        let witness = self.tree_v2.witness(&segments);

        fork(
            HashTree::Pruned(labeled_hash(LABEL_ASSETS_V1, &self.tree_v1.root_hash())),
            labeled(LABEL_ASSETS_V2, witness),
        )
    }

    pub fn witness_rewrite_v2(&self, absolute_path: &str, rewrite: &str) -> HashTree {
        assert!(absolute_path.starts_with('/'));

        // Witness incorrect url: e.g. /1234
        let segments = nested_tree_path(absolute_path, EXACT_MATCH_TERMINATOR);
        let witness = self.tree_v2.witness(&segments);

        // Witness: http_expr space <*>
        let not_found_segments = nested_tree_path(rewrite, WILDCARD_MATCH_TERMINATOR);
        let not_found_witness = self.tree_v2.witness(&not_found_segments);

        let mut combined_proof = merge_hash_trees(witness, not_found_witness.clone());

        let mut partial_path = segments.clone();
        while partial_path.pop().is_some() && !partial_path.is_empty() {
            // Push <*>
            partial_path.push(WILDCARD_MATCH_TERMINATOR.as_bytes().to_vec());

            let proof = self.tree_v2.witness(&partial_path);

            combined_proof = merge_hash_trees(combined_proof, proof);

            partial_path.pop(); // remove <*>
        }

        fork(
            HashTree::Pruned(labeled_hash(LABEL_ASSETS_V1, &self.tree_v1.root_hash())),
            labeled(LABEL_ASSETS_V2, combined_proof),
        )
    }

    pub fn expr_path_v2(&self, absolute_path: &str, rewrite: &Option<String>) -> Vec<String> {
        assert!(absolute_path.starts_with('/'));

        // "/" => ["", ""]
        // "/index.html" => ["", "index.html"]
        // "/hello/index.html" => ["", "hello", "index.html"]
        let mut path: Vec<String> = absolute_path.split('/').map(str::to_string).collect();
        // replace the first empty split segment (due to absolute path) with "http_expr"
        *path.get_mut(0).unwrap() = LABEL_HTTP_EXPR.to_string();
        path.push(EXACT_MATCH_TERMINATOR.to_string());

        match rewrite {
            None => path,
            Some(rewrite) => {
                let mut rewrite_path: Vec<String> = rewrite.split('/').map(str::to_string).collect();
                *rewrite_path.get_mut(0).unwrap() = LABEL_HTTP_EXPR.to_string();
                rewrite_path.push(WILDCARD_MATCH_TERMINATOR.to_string());

                rewrite_path
            },
        }
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

    // TODO: const STATUS_CODES_TO_CERTIFY: [u16; 2] = [200, 304];
    // TODO: delete rewrite

    fn insert_v2(&mut self, full_path: &FullPath, headers: &[HeaderField], sha256: Hash) {
        self.tree_v2.insert(
            &nested_tree_key(full_path, headers, sha256, EXACT_MATCH_TERMINATOR),
            vec![],
        );

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v2.insert(
                        &nested_tree_key(&alt_path, headers, sha256, EXACT_MATCH_TERMINATOR),
                        vec![],
                    );
                }
            }
        }
    }

    pub(crate) fn insert_rewrite_v2(&mut self, full_path: &FullPath, asset: &Asset) {
        for encoding_type in ENCODING_CERTIFICATION_ORDER.iter() {
            if let Some(encoding) = asset.encodings.get(*encoding_type) {
                self.tree_v2.insert(
                    &nested_tree_key(
                        full_path,
                        &build_asset_headers(asset, encoding, &encoding_type.to_string()),
                        encoding.sha256,
                        WILDCARD_MATCH_TERMINATOR,
                    ),
                    vec![],
                );

                return;
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
        self.tree_v2.delete(&nested_tree_key(
            &full_path,
            headers,
            sha256,
            EXACT_MATCH_TERMINATOR,
        ));

        let alt_paths = alternative_paths(full_path);

        match alt_paths {
            None => (),
            Some(alt_paths) => {
                for alt_path in alt_paths {
                    self.tree_v2.delete(&nested_tree_key(
                        &alt_path,
                        headers,
                        sha256,
                        EXACT_MATCH_TERMINATOR,
                    ));
                }
            }
        }
    }
}
