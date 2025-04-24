pub mod interface {
    use serde::Serialize;

    #[derive(Debug, Clone, Serialize)]
    pub enum ApiResponse<'a, T = ()> {
        #[serde(rename = "ok")]
        Ok { data: &'a T },
        #[serde(rename = "err")]
        Err { code: u16, message: String },
    }

    pub type ErrorResponse<'a> = ApiResponse<'a, ()>;
}

pub mod handler {
    use ic_http_certification::{HttpRequest, StatusCode};

    pub trait HttpRequestHandler {
        fn is_known_route(&self, request: &HttpRequest) -> bool;
        fn is_allowed_method(&self, method: &str) -> bool;
        fn handle_update(&self, request: &HttpRequest) -> (StatusCode, Vec<u8>);
    }
}
