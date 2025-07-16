use crate::http::routes::api::init::init_certified_response;
use crate::http::routes::api::routes::{
    EVENTS_RESPONSE_ONLY_ROUTE, EVENT_RESPONSE_ONLY_ROUTE, METRICS_RESPONSE_ONLY_ROUTE,
    METRIC_RESPONSE_ONLY_ROUTE, VIEWS_RESPONSE_ONLY_ROUTE, VIEW_RESPONSE_ONLY_ROUTE,
};
use crate::http::routes::api::types::CertifiedExactRoute;
use crate::http::types::response::ErrorResponse;
use crate::http::utils::create_json_response;
use ic_http_certification::{HttpResponse, Method, StatusCode};

pub fn init_certified_not_allowed_responses() {
    init_not_allowed_responses(&VIEW_RESPONSE_ONLY_ROUTE);
    init_not_allowed_responses(&VIEWS_RESPONSE_ONLY_ROUTE);
    init_not_allowed_responses(&EVENT_RESPONSE_ONLY_ROUTE);
    init_not_allowed_responses(&EVENTS_RESPONSE_ONLY_ROUTE);
    init_not_allowed_responses(&METRIC_RESPONSE_ONLY_ROUTE);
    init_not_allowed_responses(&METRICS_RESPONSE_ONLY_ROUTE);
}

fn init_not_allowed_responses(certified_route: &CertifiedExactRoute) {
    [
        Method::GET,
        Method::DELETE,
        Method::HEAD,
        Method::PUT,
        Method::PATCH,
        Method::TRACE,
        Method::CONNECT,
    ]
    .into_iter()
    .for_each(|method| {
        fn create_not_allowed_response() -> HttpResponse<'static> {
            let body = ErrorResponse::not_allowed().encode();
            create_json_response(StatusCode::METHOD_NOT_ALLOWED, body, None)
        }

        init_certified_response(certified_route, method, create_not_allowed_response);
    });
}
