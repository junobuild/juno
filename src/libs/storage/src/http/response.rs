use crate::constants::{
    RESPONSE_STATUS_CODE_308, RESPONSE_STATUS_CODE_404, RESPONSE_STATUS_CODE_406,
    RESPONSE_STATUS_CODE_500,
};
use crate::http::headers::build_redirect_headers;
use crate::http::types::{HeaderField, HttpResponse, StatusCode};
use crate::http::utils::{
    build_encodings, build_response_headers, build_response_redirect_headers, streaming_strategy,
};
use crate::strategies::StorageStateStrategy;
use crate::types::config::{StorageConfigIFrame, StorageConfigRedirect};
use crate::types::store::Asset;
use junobuild_collections::types::rules::Memory;

pub fn build_asset_response(
    requested_url: String,
    requested_headers: Vec<HeaderField>,
    certificate_version: Option<u16>,
    asset: Option<(Asset, Memory)>,
    rewrite_source: Option<String>,
    status_code: StatusCode,
    storage_state: &impl StorageStateStrategy,
) -> HttpResponse {
    match asset {
        Some((asset, memory)) => {
            let encodings = build_encodings(requested_headers);

            for encoding_type in encodings.iter() {

                ic_cdk::print(format!("------------encoding------------------> {} {}", encoding_type, asset.encodings.get(encoding_type).is_some()));

                if let Some(encoding) = asset.encodings.get(encoding_type) {
                    let headers = build_response_headers(
                        &requested_url,
                        &asset,
                        encoding,
                        encoding_type,
                        &certificate_version,
                        &rewrite_source,
                        &storage_state.get_config(),
                    );

                    let Asset { key, .. } = &asset;

                    match headers {
                        Ok(headers) => {
                            let body = storage_state.get_content_chunks(encoding, 0, &memory);

                            // TODO: support for HTTP response 304
                            // On hold til DFINITY foundation implements:
                            // "Add etag support to icx-proxy" - https://dfinity.atlassian.net/browse/BOUN-446
                            // See const STATUS_CODES_TO_CERTIFY: [u16; 2] = [200, 304]; in sdk certified asset canister for implementation reference

                            match body {
                                Some(body) => {
                                    return HttpResponse {
                                        body: body.clone(),
                                        headers: headers.clone(),
                                        status_code,
                                        streaming_strategy: streaming_strategy(
                                            key,
                                            encoding,
                                            encoding_type,
                                            &headers,
                                            &memory,
                                        ),
                                    }
                                }
                                None => {
                                    error_response(
                                        RESPONSE_STATUS_CODE_500,
                                        "No chunks found.".to_string(),
                                    );
                                }
                            }
                        }
                        Err(err) => {
                            return error_response(
                                RESPONSE_STATUS_CODE_406,
                                ["Permission denied. Invalid headers. ", err].join(""),
                            );
                        }
                    }
                }
            }

            error_response(
                RESPONSE_STATUS_CODE_500,
                "No asset encoding found.".to_string(),
            )
        }
        None => error_response(RESPONSE_STATUS_CODE_404, "No asset found.".to_string()),
    }
}

pub fn build_redirect_response(
    requested_url: String,
    certificate_version: Option<u16>,
    redirect: &StorageConfigRedirect,
    iframe: &StorageConfigIFrame,
) -> HttpResponse {
    let headers = build_response_redirect_headers(
        &requested_url,
        &redirect.location,
        iframe,
        &certificate_version,
    )
    .unwrap();

    HttpResponse {
        body: Vec::new().clone(),
        headers: headers.clone(),
        status_code: redirect.status_code,
        streaming_strategy: None,
    }
}

pub fn build_redirect_raw_response(
    redirect_url: &str,
    iframe: &StorageConfigIFrame,
) -> HttpResponse {
    let headers = build_redirect_headers(redirect_url, iframe);

    HttpResponse {
        body: Vec::new().clone(),
        headers: headers.clone(),
        status_code: RESPONSE_STATUS_CODE_308,
        streaming_strategy: None,
    }
}

pub fn error_response(status_code: StatusCode, body: String) -> HttpResponse {
    HttpResponse {
        body: body.as_bytes().to_vec(),
        headers: Vec::new(),
        status_code,
        streaming_strategy: None,
    }
}
