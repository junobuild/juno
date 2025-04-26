use crate::handler::adapters::page_views::{
    assert_request_page_view, assert_request_page_views, handle_insert_page_view,
    handle_insert_page_views,
};
use crate::handler::adapters::performance_metrics::{
    assert_request_performance_metric, assert_request_performance_metrics,
    handle_insert_performance_metric, handle_insert_performance_metrics,
};
use crate::handler::adapters::track_events::{
    assert_request_track_event, assert_request_track_events, handle_insert_track_event,
    handle_insert_track_events,
};
use crate::http::constants::{
    EVENTS_PATH, EVENT_PATH, KNOWN_ROUTES, METRICS_PATH, METRIC_PATH, VIEWS_PATH, VIEW_PATH,
};
use crate::http::types::handler::{HandledUpdateResult, HttpRequestHandler};
use crate::http::types::request::{HttpRequestBody, HttpRequestPath};
use crate::http::types::response::ApiResponse;
use ic_http_certification::{HttpRequest, Method, StatusCode};

pub struct OrbiterHttpRequestHandler;

impl HttpRequestHandler for OrbiterHttpRequestHandler {
    fn is_known_route(&self, request: &HttpRequest) -> bool {
        matches!(request.get_path().as_deref(), Ok(path) if KNOWN_ROUTES.contains(&path))
    }

    fn is_upgradable_method(&self, method: &Method) -> bool {
        method == "POST"
    }

    fn assert_request_upgrade_allowed(
        &self,
        request_path: &HttpRequestPath,
        body: &HttpRequestBody,
    ) -> Result<(), String> {
        match request_path.as_str() {
            VIEW_PATH => assert_request_page_view(body),
            VIEWS_PATH => assert_request_page_views(body),
            EVENT_PATH => assert_request_track_event(body),
            EVENTS_PATH => assert_request_track_events(body),
            METRIC_PATH => assert_request_performance_metric(body),
            METRICS_PATH => assert_request_performance_metrics(body),
            // Likely unexpected given is_known_route and is_allowed_method both were proven before reaching this handler.
            _ => Err(format!("Unsupported path: {}", request_path)),
        }
    }

    fn handle_update(
        &self,
        request_path: &HttpRequestPath,
        body: &HttpRequestBody,
    ) -> HandledUpdateResult {
        let response_data = match request_path.as_str() {
            VIEW_PATH => handle_insert_page_view(body),
            VIEWS_PATH => handle_insert_page_views(body),
            EVENT_PATH => handle_insert_track_event(body),
            EVENTS_PATH => handle_insert_track_events(body),
            METRIC_PATH => handle_insert_performance_metric(body),
            METRICS_PATH => handle_insert_performance_metrics(body),
            // Likely unexpected given is_known_route and is_allowed_method both were proven before reaching this handler.
            _ => Err(format!("Unsupported path: {}", request_path)),
        };

        response_data.unwrap_or_else(|err| {
            let body = ApiResponse::<()>::err(StatusCode::INTERNAL_SERVER_ERROR, err).encode();
            HandledUpdateResult::new(StatusCode::INTERNAL_SERVER_ERROR, body, None)
        })
    }
}
