use crate::http::constants::{
    EVENTS_PATH, EVENT_PATH, METRICS_PATH, METRIC_PATH, VIEWS_PATH, VIEW_PATH,
};
use crate::http::routes::services::prepare_certified_response;
use crate::http::state::types::CertifiedHttpResponse;
use ic_http_certification::HttpResponse;

pub fn prepare_certified_not_allowed_response(
    request_path: &str,
    certified_response: CertifiedHttpResponse<'static>,
) -> Result<HttpResponse<'static>, String> {
    match request_path {
        VIEW_PATH => prepare_certified_response(
            request_path,
            certified_response,
            &crate::http::routes::api::routes::VIEW_ROUTE.tree_path,
        ),
        VIEWS_PATH => prepare_certified_response(
            request_path,
            certified_response,
            &crate::http::routes::api::routes::VIEWS_ROUTE.tree_path,
        ),
        EVENT_PATH => prepare_certified_response(
            request_path,
            certified_response,
            &crate::http::routes::api::routes::EVENT_ROUTE.tree_path,
        ),
        EVENTS_PATH => prepare_certified_response(
            request_path,
            certified_response,
            &crate::http::routes::api::routes::EVENTS_ROUTE.tree_path,
        ),
        METRIC_PATH => prepare_certified_response(
            request_path,
            certified_response,
            &crate::http::routes::api::routes::METRIC_ROUTE.tree_path,
        ),
        METRICS_PATH => prepare_certified_response(
            request_path,
            certified_response,
            &crate::http::routes::api::routes::METRICS_ROUTE.tree_path,
        ),
        _ => Err(
            "Unknown request path to prepare not allowed response. This is unexpected".to_string(),
        ),
    }
}
