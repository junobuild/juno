use ic_http_certification::{HttpRequest, HttpResponse};
use crate::http::utils::{create_not_found_response};

// ---------------------------------------------------------
// Source for the HTTP implementation:
// https://github.com/dfinity/response-verification/blob/main/examples/http-certification/json-api/src/backend/src/lib.rs
// ---------------------------------------------------------

pub fn on_http_request(_request: &HttpRequest) -> HttpResponse<'static> {
    // TODO: logo
    
    // Technically should not happen because the NOT_FOUND response is initialized and certified on init and post_upgrade. 
    create_not_found_response()
}
