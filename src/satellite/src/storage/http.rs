use globset::Glob;
use hex::encode;
use ic_cdk::id;
use serde_bytes::ByteBuf;

use crate::storage::cert::build_asset_certificate_header;
use crate::storage::constants::ASSET_ENCODING_NO_COMPRESSION;
use crate::storage::store::get_config;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::http::{
    CallbackFunc, HeaderField, HttpResponse, StreamingCallbackToken, StreamingStrategy,
};
use crate::storage::types::state::StorageRuntimeState;
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey};
use crate::STATE;

pub fn streaming_strategy(
    key: &AssetKey,
    encoding: &AssetEncoding,
    encoding_type: &str,
    headers: &[HeaderField],
) -> Option<StreamingStrategy> {
    let streaming_token: Option<StreamingCallbackToken> =
        create_token(key, 0, encoding, encoding_type, headers);

    streaming_token.map(|streaming_token| StreamingStrategy::Callback {
        callback: CallbackFunc::new(id(), "http_request_streaming_callback".to_string()),
        token: streaming_token,
    })
}

pub fn create_token(
    key: &AssetKey,
    chunk_index: usize,
    encoding: &AssetEncoding,
    encoding_type: &str,
    headers: &[HeaderField],
) -> Option<StreamingCallbackToken> {
    if chunk_index + 1 >= encoding.content_chunks.len() {
        return None;
    }

    Some(StreamingCallbackToken {
        full_path: key.full_path.clone(),
        token: key.token.clone(),
        headers: headers.to_owned(),
        index: chunk_index + 1,
        sha256: Some(ByteBuf::from(encoding.sha256)),
        encoding_type: encoding_type.to_owned(),
    })
}

pub fn build_headers(
    url: &str,
    asset: &Asset,
    encoding: &AssetEncoding,
    encoding_type: &String,
) -> Result<Vec<HeaderField>, &'static str> {
    let certified_header = build_certified_headers(url);

    match certified_header {
        Err(err) => Err(err),
        Ok(certified_header) => {
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

            // Header for certification
            headers.push(certified_header);

            if encoding_type.clone() != *ASSET_ENCODING_NO_COMPRESSION {
                headers.push(HeaderField(
                    "Content-Encoding".to_string(),
                    encoding_type.to_string(),
                ));
            }

            // Headers provided as configuration of the storage
            let config_headers = build_config_headers(url);

            Ok([headers, config_headers, security_headers()].concat())
        }
    }
}

fn build_config_headers(requested_path: &str) -> Vec<HeaderField> {
    let StorageConfig {
        headers: config_headers,
        rewrites: _,
    } = get_config();

    config_headers
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
        .flat_map(|(_, headers)| headers.clone())
        .collect()
}

fn build_certified_headers(url: &str) -> Result<HeaderField, &'static str> {
    STATE.with(|state| build_certified_headers_impl(url, &state.borrow().runtime.storage))
}

fn build_certified_headers_impl(
    url: &str,
    state: &StorageRuntimeState,
) -> Result<HeaderField, &'static str> {
    build_asset_certificate_header(&state.asset_hashes, url.to_owned())
}

// Source: NNS-dapp
/// List of recommended security headers as per https://owasp.org/www-satellite-secure-headers/
/// These headers enable browser security features (like limit access to platform apis and set
/// iFrame policies, etc.).
fn security_headers() -> Vec<HeaderField> {
    vec![
        HeaderField("X-Frame-Options".to_string(), "DENY".to_string()),
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

pub fn build_encodings(headers: Vec<HeaderField>) -> Vec<String> {
    let mut encodings: Vec<String> = vec![];
    for HeaderField(name, value) in headers.iter() {
        if name.eq_ignore_ascii_case("Accept-Encoding") {
            for v in value.split(',') {
                encodings.push(v.trim().to_string());
            }
        }
    }
    encodings.push(ASSET_ENCODING_NO_COMPRESSION.to_string());

    encodings
}

pub fn error_response(status_code: u16, body: String) -> HttpResponse {
    HttpResponse {
        body: body.as_bytes().to_vec(),
        headers: Vec::new(),
        status_code,
        streaming_strategy: None,
    }
}
