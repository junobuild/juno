pub mod response {
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

pub mod request {
    use ic_http_certification::HeaderField;

    pub type HttpRequestBody = [u8];
    pub type HttpRequestHeaders = [HeaderField];
    pub type HttpRequestPath = String;
    pub type HttpRequestMethod = String;
}

pub mod handler {
    use crate::http::types::request::{HttpRequestBody, HttpRequestHeaders, HttpRequestPath};
    use crate::http::types::response::ResponseBody;
    use ic_http_certification::{HttpRequest, Method, StatusCode};
    use junobuild_shared::types::core::DomainName;

    pub trait HttpRequestHandler {
        fn is_known_route(&self, request: &HttpRequest) -> bool;

        fn should_use_handler(&self, method: &Method) -> bool;

        fn handle_update(
            &self,
            request_path: &HttpRequestPath,
            body: &HttpRequestBody,
            headers: &HttpRequestHeaders,
        ) -> HandledUpdateResult;
    }

    pub struct HandledUpdateResult {
        pub status_code: StatusCode,
        pub body: ResponseBody,
        pub restricted_origin: Option<DomainName>,
    }
}
