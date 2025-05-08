use crate::http::constants::NOT_FOUND_PATH;
use crate::http::routes::api::services::prepare_certified_response_for_requested_path;
use crate::http::routes::not_found::{
    create_uncertified_not_found_response, prepare_certified_not_found_response,
};
use crate::http::state::store::get_certified_response;
use crate::http::types::handler::{HandledUpdateResult, HttpRequestHandler};
use crate::http::types::request::{HttpRequestBody, HttpRequestHeaders, HttpRequestPath};
use crate::http::utils::create_json_response;
use ic_http_certification::{HttpRequest, HttpResponse, Method};

pub fn on_http_request(
    request: &HttpRequest,
    handler: &dyn HttpRequestHandler,
) -> HttpResponse<'static> {
    let upgrade_http_request =
        |_request_path: &HttpRequestPath,
         _body: &HttpRequestBody,
         _headers: &HttpRequestHeaders|
         -> HttpResponse<'static> { HttpResponse::builder().with_upgrade(true).build() };

    serve_request(request, handler, &upgrade_http_request)
}

pub fn on_http_request_update(
    request: &HttpRequest,
    handler: &dyn HttpRequestHandler,
) -> HttpResponse<'static> {
    let handle_http_request_update = |request_path: &HttpRequestPath,
                                      body: &HttpRequestBody,
                                      headers: &HttpRequestHeaders|
     -> HttpResponse<'static> {
        let HandledUpdateResult {
            status_code,
            body,
            restricted_origin,
        } = handler.handle_update(request_path, body, headers);
        create_json_response(status_code, body, restricted_origin)
    };

    serve_request(request, handler, &handle_http_request_update)
}

fn serve_request(
    request: &HttpRequest,
    handler: &dyn HttpRequestHandler,
    response_handler: &dyn Fn(
        &HttpRequestPath,
        &HttpRequestBody,
        &HttpRequestHeaders,
    ) -> HttpResponse<'static>,
) -> HttpResponse<'static> {
    let uri_request_path = request.get_path();

    if let Err(_err) = uri_request_path {
        // Not sure if it's exactly possible to receive a MalformedUrl but, in any case, we cannot process such entries in a certified way anyway.
        return create_uncertified_not_found_response();
    }

    let request_path = uri_request_path.unwrap();

    if handler.is_known_route(request) {
        let method = request.method();

        if handler.should_use_handler(method) {
            return response_handler(&request_path, request.body(), request.headers());
        }

        return known_route_certified_response(&request_path, method);
    }

    not_found_response(&request_path)
}

// For know routes
// OPTIONS -> 204 NO_CONTENT for cors
// DELETE, PATCH, etc. -> 405 NOT_ALLOWED
fn known_route_certified_response(
    request_path: &HttpRequestPath,
    method: &Method,
) -> HttpResponse<'static> {
    let certified_response =
        get_certified_response(request_path, &Some(method.to_string().clone()));

    if let Some(certified_response) = certified_response {
        let response =
            prepare_certified_response_for_requested_path(request_path, certified_response);

        if let Ok(response) = response {
            return response;
        }
    }

    // Fallback to not found if for some unexpected reason no response was defined
    not_found_response(request_path)
}

fn not_found_response(request_path: &HttpRequestPath) -> HttpResponse<'static> {
    let not_found = get_certified_response(&NOT_FOUND_PATH.to_string(), &None);

    if let Some(not_found) = not_found {
        let response = prepare_certified_not_found_response(request_path, not_found);

        if let Ok(response) = response {
            return response;
        }
    }

    // Technically should not happen because the NOT_FOUND response is initialized and certified on init and post_upgrade.
    create_uncertified_not_found_response()
}
