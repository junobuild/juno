use crate::handler::adapters::page_views::{handle_insert_page_view, handle_insert_page_views};
use crate::handler::adapters::performance_metrics::{
    handle_insert_performance_metric, handle_insert_performance_metrics,
};
use crate::handler::adapters::track_events::{
    handle_insert_track_event, handle_insert_track_events,
};
use crate::http::constants::{
    EVENTS_PATH, EVENT_PATH, KNOWN_ROUTES, METRICS_PATH, METRIC_PATH, VIEWS_PATH, VIEW_PATH,
};
use crate::http::types::handler::{HandledUpdateResult, HttpRequestHandler};
use crate::http::types::request::{HttpRequestBody, HttpRequestPath};
use crate::http::types::response::ApiResponse;
use ic_http_certification::{HttpRequest, Method, StatusCode};

pub struct Dispatcher;

impl HttpRequestHandler for Dispatcher {
    fn is_known_route(&self, request: &HttpRequest) -> bool {
        matches!(request.get_path().as_deref(), Ok(path) if KNOWN_ROUTES.contains(&path))
    }

    fn should_use_handler(&self, method: &Method) -> bool {
        method == "POST"
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
            _ => Err((
                StatusCode::NOT_IMPLEMENTED,
                format!("Unsupported path: {}", request_path),
            )),
        };

        response_data.unwrap_or_else(|(status_code, message)| {
            let body = ApiResponse::<()>::err(status_code, message).encode();
            HandledUpdateResult::new(status_code, body, None)
        })
    }
}
