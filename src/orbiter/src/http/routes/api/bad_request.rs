use crate::http::routes::api::init::init_certified_response;
use crate::http::routes::api::routes::{
    EVENTS_FULL_ROUTE, EVENTS_RESPONSE_ONLY_ROUTE, EVENT_FULL_ROUTE, EVENT_RESPONSE_ONLY_ROUTE,
    METRICS_FULL_ROUTE, METRICS_RESPONSE_ONLY_ROUTE, METRIC_FULL_ROUTE, METRIC_RESPONSE_ONLY_ROUTE,
    VIEWS_FULL_ROUTE, VIEWS_RESPONSE_ONLY_ROUTE, VIEW_FULL_ROUTE, VIEW_RESPONSE_ONLY_ROUTE,
};
use crate::http::routes::api::types::CertifiedExactRoute;
use crate::http::types::response::ErrorResponse;
use crate::http::utils::create_json_response;
use ic_http_certification::{HttpResponse, Method, StatusCode};

pub fn init_certified_bad_request_responses() {
    init_bad_request_responses(&VIEW_RESPONSE_ONLY_ROUTE);
    init_bad_request_responses(&VIEWS_RESPONSE_ONLY_ROUTE);
    init_bad_request_responses(&EVENT_RESPONSE_ONLY_ROUTE);
    init_bad_request_responses(&EVENTS_RESPONSE_ONLY_ROUTE);
    init_bad_request_responses(&METRIC_RESPONSE_ONLY_ROUTE);
    init_bad_request_responses(&METRICS_RESPONSE_ONLY_ROUTE);
}

fn init_bad_request_responses(certified_route: &CertifiedExactRoute) {
    [Method::POST].into_iter().for_each(|method| {
        fn create_bad_request_response() -> HttpResponse<'static> {
            let body = ErrorResponse::bad_request().encode();
            create_json_response(StatusCode::BAD_REQUEST, body, None)
        }

        init_certified_response(certified_route, method, create_bad_request_response);
    });
}
