use crate::storage::constants::ASSET_ENCODING_NO_COMPRESSION;
use crate::storage::http::types::HeaderField;
use crate::storage::types::config::{StorageConfig, StorageConfigIFrame};
use crate::storage::types::store::{Asset, AssetEncoding, EncodingType};
use crate::storage::url::matching_urls;
use hex::encode;

pub fn build_headers(
    asset: &Asset,
    encoding: &AssetEncoding,
    encoding_type: &EncodingType,
    config: &StorageConfig,
) -> Vec<HeaderField> {
    let mut headers = asset.headers.clone();

    // The Accept-Ranges HTTP response header is a marker used by the server to advertise its support for partial requests from the client for file downloads.
    headers.push(HeaderField(
        "accept-ranges".to_string(),
        "bytes".to_string(),
    ));

    headers.push(HeaderField(
        "etag".to_string(),
        format!("\"{}\"", encode(encoding.sha256)),
    ));

    // Headers for security
    headers.extend(security_headers());

    // iFrame with default to DENY for security reason
    if let Some(iframe_header) = iframe_headers(&config.unwrap_iframe()) {
        headers.push(iframe_header);
    }

    if encoding_type.clone() != *ASSET_ENCODING_NO_COMPRESSION {
        headers.push(HeaderField(
            "Content-Encoding".to_string(),
            encoding_type.to_string(),
        ));
    }

    // Headers build from the configuration
    let config_headers = build_config_headers(&asset.key.full_path, config);
    headers.extend(config_headers);

    headers
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
