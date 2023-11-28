use crate::storage::constants::ROOT_PATHS;
use crate::storage::types::config::{StorageConfig, StorageConfigRedirect};
use crate::storage::url::{matching_urls as matching_urls_utils, separator};
use std::cmp::Ordering;
use std::collections::HashMap;

pub fn rewrite_url(requested_path: &str, config: &StorageConfig) -> Option<(String, String)> {
    let StorageConfig { rewrites, .. } = config;

    let matches = matching_urls(requested_path, rewrites);

    matches
        .first()
        .map(|(source, destination)| (rewrite_source_to_path(source).clone(), destination.clone()))
}

pub fn rewrite_source_to_path(source: &String) -> String {
    [separator(source.as_str()), source]
        .join("")
        .replace('*', "")
}

pub fn is_root_path(path: &str) -> bool {
    ROOT_PATHS.contains(&path)
}

pub fn redirect_url(requested_path: &str, config: &StorageConfig) -> Option<StorageConfigRedirect> {
    let redirects = config.unwrap_redirects();

    let matches = matching_urls(requested_path, &redirects);

    matches.first().map(|(_, redirect)| redirect.clone())
}

fn matching_urls<T: Clone>(requested_path: &str, config: &HashMap<String, T>) -> Vec<(String, T)> {
    let mut matches: Vec<(String, T)> = matching_urls_utils(requested_path, config);

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
