use crate::storage::types::http_request::MapUrl;
use crate::storage::types::state::FullPath;
use std::path::Path;
use url::{ParseError, Url};

pub fn map_url(url: &String) -> Result<MapUrl, &'static str> {
    let parsed_url = build_url(url);

    match parsed_url {
        Err(_) => {
            let error = format!("Url {} cannot be parsed.", url.clone()).into_boxed_str();
            Err(Box::leak(error))
        }
        Ok(parsed_url) => {
            // Clean path without query params
            let requested_path = parsed_url.path();

            let token = map_token(parsed_url.clone());

            Ok(MapUrl {
                path: requested_path.to_string(),
                token,
            })
        }
    }
}

pub fn map_alternative_paths(path: &String) -> Vec<String> {
    // The requested path is /something.js or without file extension (/something or /something/)?
    let extension = Path::new(path).extension();

    // No alternative path if requested url target an exact file with extension
    match extension {
        Some(_) => Vec::new(),
        None => {
            // Url has no extension - e.g. is not something.js but /about or /about/
            aliases_of(&path.to_string())
        }
    }
}

pub fn alternative_paths(full_path: &FullPath) -> Option<Vec<String>> {
    // e.g. search to split index.js or index.html or .well-known
    let extensions: Vec<&str> = full_path.split('.').collect();

    let extension = extensions.last().unwrap_or(&"").trim();

    if extension != "html" {
        return None;
    }

    // regardless of the configuration, the root file matches always /
    if full_path == "/index.html" {
        return Some(Vec::from(["/".to_string()]));
    }

    aliased_by(full_path)
}

/// BEGIN: From DFINITY certified asset canister

// path like /path/to/my/asset should also be valid for /path/to/my/asset.html or /path/to/my/asset/index.html
fn aliases_of(key: &String) -> Vec<String> {
    if key.ends_with('/') {
        vec![format!("{}index.html", key)]
    } else if !key.ends_with(".html") {
        vec![format!("{}.html", key), format!("{}/index.html", key)]
    } else {
        Vec::new()
    }
}

// Determines possible original keys in case the supplied key is being aliaseded to.
// Sort-of a reverse operation of `alias_of`
fn aliased_by(key: &String) -> Option<Vec<String>> {
    if key.ends_with("/index.html") {
        Some(vec![
            key[..(key.len() - 5)].into(),
            key[..(key.len() - 10)].into(),
            key[..(key.len() - 11)].to_string(),
        ])
    } else if key.ends_with(".html") {
        Some(vec![key[..(key.len() - 5)].to_string()])
    } else {
        None
    }
}

/// END

pub fn build_url(url: &String) -> Result<Url, ParseError> {
    let separator = separator(url);

    Url::parse(&["http://localhost", separator, url].join(""))
}

/// Ensure path always will begin with a /
fn separator(url: &str) -> &str {
    if url.starts_with('/') {
        ""
    } else {
        "/"
    }
}

/// Find reserved query keyword "token" for protected assets
fn map_token(parsed_url: Url) -> Option<String> {
    let tokens: Vec<String> = parsed_url
        .query_pairs()
        .filter(|(name, _)| name == "token")
        .map(|(_, value)| value.into_owned())
        .collect();

    if !tokens.is_empty() {
        let token = tokens[0].clone();
        return Some(token);
    }

    None
}
