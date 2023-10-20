use crate::memory::STATE;
use crate::rules::types::rules::Memory;
use crate::storage::certification::certification::{
    build_asset_certificate_header, build_certified_expression,
};
use crate::storage::constants::ASSET_ENCODING_NO_COMPRESSION;
use crate::storage::http::headers::build_asset_headers;
use crate::storage::types::http::{
    CallbackFunc, HeaderField, HttpResponse, StreamingCallbackToken, StreamingStrategy,
};
use crate::storage::types::state::StorageRuntimeState;
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey, EncodingType};
use ic_cdk::id;
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

pub fn build_headers(
    url: &str,
    asset: &Asset,
    encoding: &AssetEncoding,
    encoding_type: &EncodingType,
    certificate_version: &Option<u16>,
    rewrite: &Option<String>,
) -> Result<Vec<HeaderField>, &'static str> {
    let asset_headers = build_asset_headers(asset, encoding, encoding_type);
    let certified_header = build_certified_headers(url, certificate_version, rewrite)?;
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
    rewrite: &Option<String>,
) -> Result<HeaderField, &'static str> {
    STATE.with(|state| {
        build_certified_headers_impl(
            url,
            certificate_version,
            rewrite,
            &state.borrow().runtime.storage,
        )
    })
}

fn build_certified_headers_impl(
    url: &str,
    certificate_version: &Option<u16>,
    rewrite: &Option<String>,
    state: &StorageRuntimeState,
) -> Result<HeaderField, &'static str> {
    build_asset_certificate_header(
        &state.asset_hashes,
        url.to_owned(),
        certificate_version,
        rewrite,
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

pub fn error_response(status_code: u16, body: String) -> HttpResponse {
    HttpResponse {
        body: body.as_bytes().to_vec(),
        headers: Vec::new(),
        status_code,
        streaming_strategy: None,
    }
}
