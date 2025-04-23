use crate::handler::adapters::{handle_insert_page_view, handle_insert_page_views};
use crate::http::constants::{KNOWN_ROUTES, VIEWS_PATH, VIEW_PATH};
use crate::http::types::handler::HttpRequestHandler;
use crate::http::types::interface::ApiResponse;
use ic_http_certification::{HttpRequest, StatusCode};

pub struct OrbiterHttpRequestHandler;

impl HttpRequestHandler for OrbiterHttpRequestHandler {
    fn is_known_route(&self, request: &HttpRequest) -> bool {
        matches!(request.get_path().as_deref(), Ok(path) if KNOWN_ROUTES.contains(&path))
    }

    fn is_allowed_method(&self, method: &str) -> bool {
        method == "POST"
    }

    fn handle_update(&self, request: &HttpRequest) -> (StatusCode, Vec<u8>) {
        let uri_request_path = request.get_path();

        if let Err(err) = uri_request_path {
            // Likely unexpected given is_known_route and is_allowed_method both were proven before reaching this handler.
            let body = ApiResponse::<()>::err(StatusCode::BAD_REQUEST, err.to_string()).encode();
            return (StatusCode::BAD_REQUEST, body);
        }

        let request_path = uri_request_path.unwrap();

        let result = match request_path.as_str() {
            VIEW_PATH => handle_insert_page_view(request)
                .map(|page_view| ApiResponse::ok(&page_view).encode()),
            VIEWS_PATH => {
                handle_insert_page_views(request).map(|_| ApiResponse::<()>::ok(&()).encode())
            }
            // Likely unexpected given is_known_route and is_allowed_method both were proven before reaching this handler.
            _ => Err(format!("Unsupported path: {}", request_path)),
        };

        match result {
            Ok(body) => (StatusCode::CREATED, body),
            Err(err) => {
                let body = ApiResponse::<()>::err(StatusCode::INTERNAL_SERVER_ERROR, err).encode();
                (StatusCode::INTERNAL_SERVER_ERROR, body)
            }
        }
    }
}
