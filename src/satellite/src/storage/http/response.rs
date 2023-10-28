use crate::rules::types::rules::Memory;
use crate::storage::constants::{
    RESPONSE_STATUS_CODE_200, RESPONSE_STATUS_CODE_404, RESPONSE_STATUS_CODE_405,
    RESPONSE_STATUS_CODE_500,
};
use crate::storage::http::utils::{
    build_encodings, build_headers, build_redirect_headers_http, streaming_strategy,
};
use crate::storage::types::http::{HeaderField, HttpResponse};
use crate::storage::types::store::Asset;

use crate::storage::store::get_content_chunks;
use crate::storage::types::config::StorageConfigRedirect;

pub fn build_asset_response(
    requested_url: String,
    requested_headers: Vec<HeaderField>,
    certificate_version: Option<u16>,
    asset: Option<(Asset, Memory)>,
    rewrite_destination: Option<String>,
) -> HttpResponse {
    match asset {
        Some((asset, memory)) => {
            let encodings = build_encodings(requested_headers);

            for encoding_type in encodings.iter() {
                if let Some(encoding) = asset.encodings.get(encoding_type) {
                    let headers = build_headers(
                        &requested_url,
                        &asset,
                        encoding,
                        encoding_type,
                        &certificate_version,
                        &rewrite_destination,
                    );

                    let Asset {
                        key,
                        headers: _,
                        encodings: _,
                        created_at: _,
                        updated_at: _,
                    } = &asset;

                    match headers {
                        Ok(headers) => {
                            let body = get_content_chunks(encoding, 0, &memory);

                            // TODO: support for HTTP response 304
                            // On hold til DFINITY foundation implements:
                            // "Add etag support to icx-proxy" - https://dfinity.atlassian.net/browse/BOUN-446
                            // See const STATUS_CODES_TO_CERTIFY: [u16; 2] = [200, 304]; in sdk certified asset canister for implementation reference

                            match body {
                                Some(body) => {
                                    return HttpResponse {
                                        body: body.clone(),
                                        headers: headers.clone(),
                                        status_code: RESPONSE_STATUS_CODE_200,
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
                                RESPONSE_STATUS_CODE_405,
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
) -> HttpResponse {
    let headers =
        build_redirect_headers_http(&requested_url, &redirect.location, &certificate_version)
            .unwrap();

    HttpResponse {
        body: Vec::new().clone(),
        headers: headers.clone(),
        status_code: redirect.status_code,
        streaming_strategy: None,
    }
}

pub fn error_response(status_code: u16, body: String) -> HttpResponse {
    HttpResponse {
        body: body.as_bytes().to_vec(),
        headers: Vec::new(),
        status_code,
        streaming_strategy: None,
    }
}
