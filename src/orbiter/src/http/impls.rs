use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::interface::{ApiResponse, ResponseBody};
use ic_http_certification::StatusCode;
use junobuild_shared::types::core::DomainName;
use serde::Serialize;

impl<'a, T: Serialize> ApiResponse<'a, T> {
    pub fn ok(data: &'a T) -> ApiResponse<'a, T> {
        Self::Ok { data }
    }

    pub fn not_found() -> Self {
        Self::err(StatusCode::NOT_FOUND, "Not found".to_string())
    }

    pub fn not_allowed() -> Self {
        Self::err(
            StatusCode::METHOD_NOT_ALLOWED,
            "Method not allowed".to_string(),
        )
    }

    pub fn err(code: StatusCode, message: String) -> Self {
        Self::Err {
            code: code.as_u16(),
            message,
        }
    }

    pub fn encode(&self) -> ResponseBody {
        serde_json::to_vec(self).expect("Failed to serialize value")
    }
}

impl HandledUpdateResult {
    pub fn new(
        status_code: StatusCode,
        body: ResponseBody,
        restricted_origin: Option<DomainName>,
    ) -> Self {
        Self {
            status_code,
            body,
            restricted_origin,
        }
    }
}
