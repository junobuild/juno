use crate::constants::ASSET_ENCODING_NO_COMPRESSION;
use crate::http::types::HeaderField;
use crate::types::config::{StorageConfig, StorageConfigIFrame};
use crate::types::store::{Asset, AssetEncoding, EncodingType};
use crate::url::matching_urls;
use hex::encode;
use std::collections::HashMap;

pub fn build_headers(
    asset: &Asset,
    encoding: &AssetEncoding,
    encoding_type: &EncodingType,
    config: &StorageConfig,
) -> Vec<HeaderField> {
    // Starts with the headers build from the configuration
    let mut headers: HashMap<String, String> = build_config_headers(&asset.key.full_path, config)
        .into_iter()
        .map(|HeaderField(key, value)| (key.to_lowercase(), value))
        .collect();

    // Asset-level headers take precedence on the config - a specific header is more important than default configuration.
    for HeaderField(key, value) in &asset.headers {
        headers.insert(key.to_lowercase(), value.clone());
    }

    // If the asset is accessible only via a query token,
    // we set a few headers to prevent indexing and caching by crawlers or intermediaries.
    if asset.key.token.is_some() {
        for HeaderField(key, value) in token_headers() {
            headers.insert(key.to_lowercase(), value);
        }
    }

    // The Accept-Ranges HTTP response header is a marker used by the server to advertise its support for partial requests from the client for file downloads.
    headers.insert("accept-ranges".to_string(), "bytes".to_string());

    headers.insert(
        "etag".to_string(),
        format!("\"{}\"", encode(encoding.sha256)),
    );

    // Headers for security
    for HeaderField(key, value) in security_headers() {
        headers.insert(key.to_lowercase(), value);
    }

    // iFrame with default to DENY for security reason
    if let Some(HeaderField(key, value)) = iframe_headers(&config.unwrap_iframe()) {
        headers.insert(key.to_lowercase(), value);
    }

    if encoding_type.clone() != *ASSET_ENCODING_NO_COMPRESSION {
        headers.insert("content-encoding".to_string(), encoding_type.to_string());
    }

    headers
        .into_iter()
        .map(|(key, value)| HeaderField(key, value))
        .collect()
}

pub fn build_redirect_headers(location: &str, iframe: &StorageConfigIFrame) -> Vec<HeaderField> {
    let mut headers = Vec::new();

    // Headers for security
    headers.extend(security_headers());

    // iFrame with default to none
    if let Some(iframe_header) = iframe_headers(iframe) {
        headers.push(iframe_header);
    }

    headers.push(HeaderField("Location".to_string(), location.to_string()));

    headers
}

// Source: NNS-dapp
/// List of recommended security headers as per https://owasp.org/www-satellite-secure-headers/
/// These headers enable browser security features (like limit access to platform apis and set
/// iFrame policies, etc.).
fn security_headers() -> Vec<HeaderField> {
    vec![
        HeaderField("X-Content-Type-Options".to_string(), "nosniff".to_string()),
        HeaderField(
            "Strict-Transport-Security".to_string(),
            "max-age=31536000 ; includeSubDomains".to_string(),
        ),
        // "Referrer-Policy: no-referrer" would be more strict, but breaks local dev deployment
        // same-origin is still ok from a security perspective
        HeaderField("Referrer-Policy".to_string(), "same-origin".to_string()),
    ]
}

fn iframe_headers(iframe: &StorageConfigIFrame) -> Option<HeaderField> {
    match iframe {
        StorageConfigIFrame::Deny => Some(HeaderField(
            "X-Frame-Options".to_string(),
            "DENY".to_string(),
        )),
        StorageConfigIFrame::SameOrigin => Some(HeaderField(
            "X-Frame-Options".to_string(),
            "SAMEORIGIN".to_string(),
        )),
        StorageConfigIFrame::AllowAny => None,
    }
}

fn token_headers() -> Vec<HeaderField> {
    vec![
        // Prevents search engines from indexing the asset or following links from it.
        HeaderField("X-Robots-Tag".to_string(), "noindex, nofollow".to_string()),
        // Ensures the asset is not cached anywhere (neither in shared caches nor in the browser),
        // and is considered private to the requesting user.
        HeaderField(
            "Cache-Control".to_string(),
            "private, no-store".to_string(),
        ),
    ]
}

pub fn build_config_headers(
    requested_path: &str,
    StorageConfig {
        headers: config_headers,
        ..
    }: &StorageConfig,
) -> Vec<HeaderField> {
    matching_urls(requested_path, config_headers)
        .iter()
        .flat_map(|(_, headers)| headers.clone())
        .collect()
}
