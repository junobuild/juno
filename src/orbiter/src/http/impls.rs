use ic_http_certification::StatusCode;
use serde::Serialize;
use crate::http::types::ApiResponse;

impl<'a, T: Serialize> ApiResponse<'a, T> {
    pub fn ok(data: &'a T) -> ApiResponse<T> {
        Self::Ok { data }
    }

    pub fn not_found() -> Self {
        Self::err(StatusCode::NOT_FOUND.as_u16(), "Not found".to_string())
    }

    pub fn not_allowed() -> Self {
        Self::err(StatusCode::METHOD_NOT_ALLOWED.as_u16(), "Method not allowed".to_string())
    }

    fn err(code: u16, message: String) -> Self {
        Self::Err { code, message }
    }

    pub fn encode(&self) -> Vec<u8> {
        serde_json::to_vec(self).expect("Failed to serialize value")
    }
}