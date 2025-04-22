use ic_http_certification::StatusCode;
use serde::Serialize;
use crate::http::types::interface::ApiResponse;

impl<'a, T: Serialize> ApiResponse<'a, T> {
    pub fn ok(data: &'a T) -> ApiResponse<'a, T> {
        Self::Ok { data }
    }

    pub fn not_found() -> Self {
        Self::err(StatusCode::NOT_FOUND, "Not found".to_string())
    }

    pub fn not_allowed() -> Self {
        Self::err(StatusCode::METHOD_NOT_ALLOWED, "Method not allowed".to_string())
    }

    fn err(code: StatusCode, message: String) -> Self {
        Self::Err { code: code.as_u16(), message }
    }

    pub fn encode(&self) -> Vec<u8> {
        serde_json::to_vec(self).expect("Failed to serialize value")
    }
}