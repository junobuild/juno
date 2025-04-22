use crate::http::constants::{NOT_FOUND_PATH, VIEWS_PATH};
use crate::http::not_found::{
    create_uncertified_not_found_response, prepare_certified_not_found_response,
};
use crate::http::store::get_certified_response;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use crate::http::utils::create_json_response;
use crate::types::core::UpdateHandler;
// ---------------------------------------------------------
// Source for the HTTP implementation:
// https://github.com/dfinity/response-verification/blob/main/examples/http-certification/json-api/src/backend/src/lib.rs
// ---------------------------------------------------------

pub fn on_http_request(request: &HttpRequest) -> HttpResponse<'static> {
    let upgrade_http_request = |request: &HttpRequest| -> HttpResponse<'static> {
        HttpResponse::builder().with_upgrade(true).build()
    };

    http_request_handler(request, &upgrade_http_request)
}

pub fn on_http_request_update(request: &HttpRequest, update_handler: UpdateHandler) -> HttpResponse<'static> {
    let set_page_view = |request: &HttpRequest| -> HttpResponse<'static> {
        let result = update_handler(request);
        
        if let Ok(body) = result {
            return create_json_response(StatusCode::CREATED, body);
        }
        
        // TODO: TODO: we can maybe throw a better exception?
        create_uncertified_not_found_response()
    };

    http_request_handler(request, &set_page_view)
}

type RouteHandler = dyn Fn(&HttpRequest) -> HttpResponse<'static>;

fn http_request_handler(
    request: &HttpRequest,
    handler: &dyn Fn(&HttpRequest) -> HttpResponse<'static>,
) -> HttpResponse<'static> {
    let uri_request_path = request.get_path();

    if let Err(_err) = uri_request_path {
        // Not sure if it's exactly possible to receive a MalformedUrl but, in any case, we cannot process such entries in a certified way anyway.
        return create_uncertified_not_found_response();
    }

    let request_path = uri_request_path.unwrap();

    if request_path == VIEWS_PATH {
        let method = request.method().to_string();

        if method != "POST" {
            return handler(&request);
        }

        // TODO: Technically here it would be more accurate to return a METHOD_NOT_ALLOWED response
    }

    let not_found = get_certified_response(NOT_FOUND_PATH);

    if let Some(not_found) = not_found {
        let response = prepare_certified_not_found_response(request_path, not_found);

        // TODO: I guess technically it can be another type of error if None
        if let Ok(response) = response {
            return response;
        }
    }

    // Technically should not happen because the NOT_FOUND response is initialized and certified on init and post_upgrade.
    create_uncertified_not_found_response()
}
