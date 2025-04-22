use serde::{Serialize};

#[derive(Debug, Clone, Serialize)]
pub enum ApiResponse<'a, T = ()> {
    #[serde(rename = "ok")]
    Ok { data: &'a T },
    #[serde(rename = "err")]
    Err { code: u16, message: String },
}

pub type ErrorResponse<'a> = ApiResponse<'a, ()>;
