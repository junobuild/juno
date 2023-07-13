use globset::Glob;

use crate::storage::types::config::StorageConfig;

pub fn rewrite_url(requested_path: &str, config: &StorageConfig) -> Option<String> {
    let StorageConfig {
        headers: _,
        rewrites,
    } = config;

    let rewrite = rewrites.iter().find(|(source, _)| {
        let glob = Glob::new(source.clone());

        match glob {
            Err(_) => false,
            Ok(glob) => {
                let matcher = glob.compile_matcher();
                matcher.is_match(requested_path)
            }
        }
    });

    match rewrite {
        None => None,
        Some((_, destination)) => Some(destination.clone()),
    }
}
