use crate::http::routes::api::init::init_certified_response;
use crate::http::routes::api::routes::{
    EVENTS_FULL_ROUTE, EVENT_FULL_ROUTE, METRICS_FULL_ROUTE, METRIC_FULL_ROUTE, VIEWS_FULL_ROUTE, VIEW_FULL_ROUTE,
};
use crate::http::routes::api::types::CertifiedExactRoute;
use ic_http_certification::{HttpResponse, Method, StatusCode};

pub fn init_certified_cors_preflight_responses() {
    init_cors_preflight_responses(&VIEW_ROUTE);
    init_cors_preflight_responses(&VIEWS_ROUTE);
    init_cors_preflight_responses(&EVENT_ROUTE);
    init_cors_preflight_responses(&EVENTS_ROUTE);
    init_cors_preflight_responses(&METRIC_ROUTE);
    init_cors_preflight_responses(&METRICS_ROUTE);
}

fn init_cors_preflight_responses(certified_route: &CertifiedExactRoute) {
    [Method::OPTIONS].into_iter().for_each(|method| {
        init_certified_response(certified_route, method, create_cors_preflight_response);
    });
}

fn create_cors_preflight_response() -> HttpResponse<'static> {
    HttpResponse::builder()
        .with_status_code(StatusCode::NO_CONTENT)
        .with_headers(vec![
            // For performance and cost reasons, we do not handle OPTIONS with update calls.
            // Instead, we allow all origins here to avoid needing dynamic logic with a certified query.
            //
            // Developers can still specify a more restrictive origin in the POST response
            // (handled via http_request_update, where dynamic headers can be certified).
            ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
            (
                "Access-Control-Allow-Methods".to_string(),
                "POST, OPTIONS".to_string(),
            ),
            (
                "Access-Control-Allow-Headers".to_string(),
                "Content-Type".to_string(),
            ),
        ])
        .with_body(vec![])
        .build()
}
