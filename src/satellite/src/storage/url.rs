use crate::storage::types::config::{StorageConfig, TrailingSlash};
use crate::storage::types::http_request::Url as CustomUrl;
use crate::STATE;
use url::{ParseError, Url};

pub fn parse_url(url: &String) -> Result<CustomUrl, &'static str> {
    let parsed_url = build_url(url);

    match parsed_url {
        Err(_) => {
            let error = format!("Url {} cannot be parsed.", url.clone()).into_boxed_str();
            Err(Box::leak(error))
        }
        Ok(parsed_url) => {
            let requested_path = parsed_url.path();

            Ok(CustomUrl {
                requested_path: requested_path.to_string(),
                full_path: map_url(requested_path),
                token: map_token(parsed_url),
            })
        }
    }
}

/// if an HTML is added to the assets, then according config we map it for the certified_assets
pub fn alternative_path(
    full_path: &String,
    StorageConfig { trailing_slash }: &StorageConfig,
) -> Option<String> {
    // e.g. search to split index.js or index.html or .well-known
    let extensions: Vec<&str> = full_path.split('.').collect();

    let extension = extensions.last().unwrap_or(&"").trim();

    if extension != "html" {
        return None;
    }

    // regardless of the configuration, the root file matches always /
    if full_path == "/index.html" {
        return Some("/".to_string());
    }

    // if .html then /something/index.html then if trailing slash always the /something/ else /something
    match trailing_slash {
        TrailingSlash::Always => Some(full_path.clone().replace("index.html", "")),
        TrailingSlash::Never => Some(full_path.clone().replace(".html", "")),
    }
}

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

///
/// Make storage / CDN a bit clever when it comes to resolving HTML resources
///
fn map_url(full_path: &str) -> String {
    let StorageConfig { trailing_slash } =
        STATE.with(|state| state.borrow().stable.storage.config.clone());

    let mapped_full_path: String = map_trailing_slash(full_path);

    match trailing_slash {
        TrailingSlash::Always => map_trailing_slash_always(&mapped_full_path),
        TrailingSlash::Never => map_trailing_slash_never(&mapped_full_path),
    }
}

/// if requested URL ends with a / we map to /index.html. e.g. https://papy.rs/about/ -> https://papy.rs/about/index.html
/// this is also useful to always map the root. e.g. https://papy.rs/ -> https://papy.rs/index.html
fn map_trailing_slash(full_path: &str) -> String {
    if full_path.ends_with('/') {
        return full_path.to_owned() + "index.html";
    }

    full_path.to_string()
}

/// if a requested URL has no extension we map to /index.html. e.g. https://papy.rs/about -> https://papy.rs/about/index.html
fn map_trailing_slash_always(full_path: &str) -> String {
    map_trailing_slash_extension(full_path, "/index.html")
}

/// if a requested URL has no extension we map to .html. e.g. https://papy.rs/about -> https://papy.rs/about.html
fn map_trailing_slash_never(full_path: &str) -> String {
    map_trailing_slash_extension(full_path, ".html")
}

fn map_trailing_slash_extension(full_path: &str, add_ons: &str) -> String {
    // e.g. search to split index.js or index.html or .well-known
    let extensions = full_path.split('.');

    if extensions.count() == 1 {
        return full_path.to_owned() + add_ons;
    }

    full_path.to_string()
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
