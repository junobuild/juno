pub mod interface {
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
}

pub mod handler {
    use crate::http::types::interface::ResponseBody;
    use ic_http_certification::{HttpRequest, StatusCode};
    use junobuild_shared::types::core::DomainName;

    pub trait HttpRequestHandler {
        fn is_known_route(&self, request: &HttpRequest) -> bool;
        fn should_use_handler(&self, method: &str) -> bool;
        fn handle_update(&self, request: &HttpRequest) -> HandledUpdateResult;
    }

    pub struct HandledUpdateResult {
        pub status_code: StatusCode,
        pub body: ResponseBody,
        pub restricted_origin: Option<DomainName>,
    }
}
