use crate::certification::cert::{build_asset_certificate_header, build_certified_expression};
use crate::constants::ASSET_ENCODING_NO_COMPRESSION;
use crate::http::headers::{build_headers, build_redirect_headers};
use crate::http::types::{CallbackFunc, HeaderField, StreamingCallbackToken, StreamingStrategy};
use crate::memory::STATE;
use crate::types::config::{StorageConfig, StorageConfigIFrame};
use crate::types::runtime_state::StorageRuntimeState;
use crate::types::store::{Asset, AssetEncoding, AssetKey, EncodingType};
use ic_certification::HashTree;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::ic::api::id;
use serde_bytes::ByteBuf;

pub fn streaming_strategy(
    key: &AssetKey,
    encoding: &AssetEncoding,
    encoding_type: &str,
    headers: &[HeaderField],
    memory: &Memory,
) -> Option<StreamingStrategy> {
    let streaming_token: Option<StreamingCallbackToken> =
        create_token(key, 0, encoding, encoding_type, headers, memory);

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
    memory: &Memory,
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
        memory: memory.clone(),
    })
}

pub fn build_response_headers(
    url: &str,
    asset: &Asset,
    encoding: &AssetEncoding,
    encoding_type: &EncodingType,
    certificate_version: &Option<u16>,
    rewrite_source: &Option<String>,
    config: &StorageConfig,
    sigs_tree: HashTree,
) -> Result<Vec<HeaderField>, &'static str> {
    let asset_headers = build_headers(asset, encoding, encoding_type, config);

    extend_headers_with_certification(
        asset_headers,
        url,
        certificate_version,
        rewrite_source,
        sigs_tree,
    )
}

pub fn build_response_redirect_headers(
    url: &str,
    location: &str,
    iframe: &StorageConfigIFrame,
    certificate_version: &Option<u16>,
    sigs_tree: HashTree,
) -> Result<Vec<HeaderField>, &'static str> {
    let asset_headers = build_redirect_headers(location, iframe);

    extend_headers_with_certification(asset_headers, url, certificate_version, &None, sigs_tree)
}

fn extend_headers_with_certification(
    asset_headers: Vec<HeaderField>,
    url: &str,
    certificate_version: &Option<u16>,
    rewrite_source: &Option<String>,
    sigs_tree: HashTree,
) -> Result<Vec<HeaderField>, &'static str> {
    let certified_header =
        build_certified_headers(url, certificate_version, rewrite_source, sigs_tree)?;
    let certified_expression = build_certified_expression(&asset_headers, certificate_version)?;

    match certified_expression {
        None => Ok([asset_headers, vec![certified_header]].concat()),
        Some(certified_expression) => {
            Ok([asset_headers, vec![certified_header, certified_expression]].concat())
        }
    }
}

fn build_certified_headers(
    url: &str,
    certificate_version: &Option<u16>,
    rewrite_source: &Option<String>,
    sigs_tree: HashTree,
) -> Result<HeaderField, &'static str> {
    STATE.with(|state| {
        build_certified_headers_impl(
            url,
            certificate_version,
            rewrite_source,
            sigs_tree,
            &state.borrow().runtime.storage,
        )
    })
}

fn build_certified_headers_impl(
    url: &str,
    certificate_version: &Option<u16>,
    rewrite_source: &Option<String>,
    sigs_tree: HashTree,
    state: &StorageRuntimeState,
) -> Result<HeaderField, &'static str> {
    build_asset_certificate_header(
        &state.asset_hashes,
        url.to_owned(),
        certificate_version,
        rewrite_source,
        sigs_tree,
    )
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
