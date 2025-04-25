pub mod interface {
    use ic_http_certification::HeaderField;
    use junobuild_shared::types::core::Blob;
    use serde::Serialize;

    #[derive(Debug, Clone, Serialize)]
    pub enum ApiResponse<'a, T = ()> {
        #[serde(rename = "ok")]
        Ok { data: &'a T },
        #[serde(rename = "err")]
        Err { code: u16, message: String },
    }

    pub type ErrorResponse<'a> = ApiResponse<'a, ()>;

    pub type ResponseBody = Blob;
    pub type ResponseHeaders = Vec<HeaderField>;
}

pub mod handler {
    use crate::http::types::interface::{ResponseBody, ResponseHeaders};
    use ic_http_certification::{HttpRequest, StatusCode};

    pub trait HttpRequestHandler {
        fn is_known_route(&self, request: &HttpRequest) -> bool;
        fn is_allowed_method(&self, method: &str) -> bool;
        fn handle_update(&self, request: &HttpRequest) -> HandledUpdateResult;
    }
    
    pub struct HandledUpdateResult {
        pub status_code: StatusCode,
        pub body: ResponseBody,
        pub headers: Option<ResponseHeaders>,
    }
}
