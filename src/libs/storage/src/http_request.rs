use crate::constants::{RESPONSE_STATUS_CODE_200, RESPONSE_STATUS_CODE_405};
use crate::http::response::{
    build_asset_response, build_redirect_raw_response, build_redirect_response, error_response,
};
use crate::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use crate::http::utils::create_token;
use crate::routing::get_routing;
use crate::strategies::{StorageCertificateStrategy, StorageStateStrategy};
use crate::types::http_request::{
    Routing, RoutingDefault, RoutingRedirect, RoutingRedirectRaw, RoutingRewrite,
};
use ic_cdk::trap;

// ---------------------------------------------------------
// Http
// ---------------------------------------------------------

pub fn http_request(
    HttpRequest {
        method,
        url,
        headers: req_headers,
        body: _,
        certificate_version,
    }: HttpRequest,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) -> HttpResponse {
    if method != "GET" {
        return error_response(RESPONSE_STATUS_CODE_405, "Method Not Allowed.".to_string());
    }

    let result = get_routing(url, &req_headers, true, storage_state);

    match result {
        Ok(routing) => match routing {
            Routing::Default(RoutingDefault { url, asset }) => build_asset_response(
                url,
                req_headers,
                certificate_version,
                asset,
                None,
                RESPONSE_STATUS_CODE_200,
                storage_state,
                certificate,
            ),
            Routing::Rewrite(RoutingRewrite {
                url,
                asset,
                source,
                status_code,
            }) => build_asset_response(
                url,
                req_headers,
                certificate_version,
                asset,
                Some(source),
                status_code,
                storage_state,
                certificate,
            ),
            Routing::Redirect(RoutingRedirect {
                url,
                redirect,
                iframe,
            }) => {
                build_redirect_response(url, certificate_version, &redirect, &iframe, certificate)
            }
            Routing::RedirectRaw(RoutingRedirectRaw {
                redirect_url,
                iframe,
            }) => build_redirect_raw_response(&redirect_url, &iframe),
        },
        Err(err) => error_response(
            RESPONSE_STATUS_CODE_405,
            ["Permission denied. Cannot perform this operation. ", err].join(""),
        ),
    }
}

pub fn http_request_streaming_callback(
    StreamingCallbackToken {
        token,
        headers,
        index,
        sha256: _,
        full_path,
        encoding_type,
        memory: _,
    }: StreamingCallbackToken,
    storage_state: &impl StorageStateStrategy,
) -> StreamingCallbackHttpResponse {
    let asset = storage_state.get_public_asset(full_path, token);

    match asset {
        Some((asset, memory)) => {
            let encoding = asset.encodings.get(&encoding_type);

            match encoding {
                Some(encoding) => {
                    let body = storage_state.get_content_chunks(encoding, index, &memory);

                    match body {
                        Some(body) => StreamingCallbackHttpResponse {
                            token: create_token(
                                &asset.key,
                                index,
                                encoding,
                                &encoding_type,
                                &headers,
                                &memory,
                            ),
                            body: body.clone(),
                        },
                        None => trap("Streamed chunks not found."),
                    }
                }
                None => trap("Streamed asset encoding not found."),
            }
        }
        None => trap("Streamed asset not found."),
    }
}
