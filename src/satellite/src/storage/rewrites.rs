use crate::storage::constants::REWRITE_TO_ROOT_INDEX_HTML;
use crate::storage::types::config::{StorageConfig, StorageConfigRedirect, StorageConfigRewrites};
use crate::storage::url::separator;
use globset::Glob;
use std::cmp::Ordering;
use std::collections::HashMap;

pub fn init_rewrites() -> StorageConfigRewrites {
    let (source, destination) = REWRITE_TO_ROOT_INDEX_HTML;
    HashMap::from([(source.to_string(), destination.to_string())])
}

pub fn rewrite_url(requested_path: &str, config: &StorageConfig) -> Option<(String, String)> {
    let StorageConfig {
        headers: _,
        rewrites,
        redirects: _,
    } = config;

    let matches = matching_urls(requested_path, rewrites);

    matches.first().map(|(source, destination)| {
        let src_path = [separator(source.as_str()), source]
            .join("")
            .replace('*', "");

        (src_path.clone(), destination.clone())
    })
}

pub fn redirect_url(requested_path: &str, config: &StorageConfig) -> Option<StorageConfigRedirect> {
    let redirects = config.unwrap_redirects();

    let matches = matching_urls(requested_path, &redirects);

    matches.first().map(|(_, destination)| destination.clone())
}

fn matching_urls<T: Clone>(requested_path: &str, config: &HashMap<String, T>) -> Vec<(String, T)> {
    let mut matches: Vec<(String, T)> = config
        .iter()
        .filter(|(source, _)| {
            let glob = Glob::new(source);

            match glob {
                Err(_) => false,
                Ok(glob) => {
                    let matcher = glob.compile_matcher();
                    matcher.is_match(requested_path)
                }
            }
        })
        .map(|(source, destination)| (source.clone(), destination.clone()))
        .collect();

    matches.sort_by(|(a, _), (b, _)| {
        let a_parts: Vec<&str> = a.split('/').collect();
        let b_parts: Vec<&str> = b.split('/').collect();

        // Compare the lengths first (in reverse order for longer length first - i.e. the rewrite with the more sub-paths first)
        let length_cmp = b_parts.len().cmp(&a_parts.len());

        if length_cmp == Ordering::Equal {
            // If lengths are equal, sort alphabetically
            a.cmp(b)
        } else {
            length_cmp
        }
    });

    matches
}
