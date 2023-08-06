use crate::storage::constants::REWRITE_TO_ROOT_INDEX_HTML;
use globset::Glob;
use std::collections::HashMap;

use crate::storage::types::config::{StorageConfig, StorageConfigRewrites};

pub fn init_rewrites() -> StorageConfigRewrites {
    let (source, destination) = REWRITE_TO_ROOT_INDEX_HTML;
    HashMap::from([(source.to_string(), destination.to_string())])
}

pub fn rewrite_url(requested_path: &str, config: &StorageConfig) -> Option<String> {
    let StorageConfig {
        headers: _,
        rewrites,
    } = config;

    let rewrite = rewrites.iter().find(|(source, _)| {
        let glob = Glob::new(source);

        match glob {
            Err(_) => false,
            Ok(glob) => {
                let matcher = glob.compile_matcher();
                matcher.is_match(requested_path)
            }
        }
    });

    rewrite.map(|(_, destination)| destination.clone())
}
