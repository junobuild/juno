use crate::http::constants::NOT_FOUND_PATH;
use crate::http::not_allowed::prepare_certified_not_allowed_response;
use crate::http::not_found::{
    create_uncertified_not_found_response, prepare_certified_not_found_response,
};
use crate::http::state::store::get_certified_response;
use crate::http::types::handler::HttpRequestHandler;
use crate::http::utils::create_json_response;
use ic_http_certification::{HttpRequest, HttpResponse};
// ---------------------------------------------------------
// Source for the HTTP implementation:
// https://github.com/dfinity/response-verification/blob/main/examples/http-certification/json-api/src/backend/src/lib.rs
// ---------------------------------------------------------

pub fn on_http_request(
    request: &HttpRequest,
    handler: &dyn HttpRequestHandler,
) -> HttpResponse<'static> {
    let upgrade_http_request = |_request: &HttpRequest| -> HttpResponse<'static> {
        HttpResponse::builder().with_upgrade(true).build()
    };

    http_request_handler(request, handler, &upgrade_http_request)
}

pub fn on_http_request_update(
    request: &HttpRequest,
    handler: &dyn HttpRequestHandler,
) -> HttpResponse<'static> {
    let handle_http_request_update = |request: &HttpRequest| -> HttpResponse<'static> {
        let (status_code, body) = handler.handle_update(request);
        create_json_response(status_code, body)
    };

    http_request_handler(request, handler, &handle_http_request_update)
}

fn http_request_handler(
    request: &HttpRequest,
    handler: &dyn HttpRequestHandler,
    response_handler: &dyn Fn(&HttpRequest) -> HttpResponse<'static>,
) -> HttpResponse<'static> {
    let uri_request_path = request.get_path();

    if let Err(_err) = uri_request_path {
        // Not sure if it's exactly possible to receive a MalformedUrl but, in any case, we cannot process such entries in a certified way anyway.
        return create_uncertified_not_found_response();
    }

    let request_path = uri_request_path.unwrap();

    if handler.is_known_route(request) {
        let method = request.method().to_string();

        if handler.is_allowed_method(&method) {
            return response_handler(&request);
        }

        let not_allowed = get_certified_response(&request_path, &Some(method.clone()));

        if let Some(not_allowed) = not_allowed {
            let response = prepare_certified_not_allowed_response(&request_path, not_allowed);

            // TODO: I guess technically it can be another type of error if None
            if let Ok(response) = response {
                return response;
            }
        }
    }

    let not_found = get_certified_response(&NOT_FOUND_PATH.to_string(), &None);

    if let Some(not_found) = not_found {
        let response = prepare_certified_not_found_response(&request_path, not_found);

        // TODO: I guess technically it can be another type of error if None
        if let Ok(response) = response {
            return response;
        }
    }

    // Technically should not happen because the NOT_FOUND response is initialized and certified on init and post_upgrade.
    create_uncertified_not_found_response()
}
