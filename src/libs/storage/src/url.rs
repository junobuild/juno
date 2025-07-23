use crate::types::http_request::MapUrl;
use crate::types::state::FullPath;
use globset::Glob;
use std::collections::HashMap;
use url::Url;
use urlencoding::decode;

pub fn map_url(url: &str) -> Result<MapUrl, &'static str> {
    let parsed_url = build_url(url)?;

    // Clean path without query params
    let requested_path = decode_path(&parsed_url)?;

    let token = map_token(parsed_url.clone());

    Ok(MapUrl {
        path: requested_path,
        token,
    })
}

pub fn map_alternative_paths(path: &String) -> Vec<String> {
    aliases_of(&path.to_string())
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

// ---------------------------------------------------------
// BEGIN: From DFINITY certified asset canister
// ---------------------------------------------------------

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
    if key == "/index.html" {
        Some(vec![
            key[..(key.len() - 5)].into(),
            key[..(key.len() - 10)].into(),
        ])
    } else if key.ends_with("/index.html") {
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

// ---------------------------------------------------------
// END
// ---------------------------------------------------------

fn build_url(url: &str) -> Result<Url, &'static str> {
    let separator = separator(url);

    let parsed_url = Url::parse(&["http://localhost", separator, url].join(""));

    match parsed_url {
        Err(_) => {
            let error = format!("Url {} cannot be parsed.", url.to_owned()).into_boxed_str();
            Err(Box::leak(error))
        }
        Ok(url) => Ok(url),
    }
}

/// Currently encoded URL are not supported, only non encoded path because the certification except a tree containing only non encoded paths.
fn decode_path(parsed_url: &Url) -> Result<String, &'static str> {
    let path = parsed_url.path();

    let decoded_path = decode(path);

    match decoded_path {
        Err(_) => {
            let error = format!("Path {path} cannot be decoded.").into_boxed_str();
            Err(Box::leak(error))
        }
        Ok(decoded_path) => Ok(decoded_path.to_string()),
    }
}

/// Ensure path always will begin with a /
pub fn separator(url: &str) -> &str {
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
        .filter_map(|(name, value)| {
            if name == "token" {
                Some(value.into_owned())
            } else {
                None
            }
        })
        .collect();

    if !tokens.is_empty() {
        let token = tokens[0].clone();
        return Some(token);
    }

    None
}

pub fn matching_urls<T: Clone>(
    requested_path: &str,
    config: &HashMap<String, T>,
) -> Vec<(String, T)> {
    config
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
        .collect()
}
