use crate::rules::types::rules::Memory;
use crate::storage::types::store::EncodingType;
use crate::types::core::Blob;
use candid::{define_function, CandidType};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct HeaderField(pub String, pub String);

pub type StatusCode = u16;

#[derive(CandidType, Deserialize, Clone)]
pub struct HttpRequest {
    pub url: String,
    pub method: String,
    pub headers: Vec<HeaderField>,
    pub body: Blob,
    pub certificate_version: Option<u16>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct HttpResponse {
    pub body: Blob,
    pub headers: Vec<HeaderField>,
    pub status_code: StatusCode,
    pub streaming_strategy: Option<StreamingStrategy>,
}

define_function!(pub CallbackFunc : () -> () query);

#[derive(CandidType, Deserialize, Clone)]
pub enum StreamingStrategy {
    Callback {
        token: StreamingCallbackToken,
        callback: CallbackFunc,
    },
}

#[derive(CandidType, Deserialize, Clone)]
pub struct StreamingCallbackToken {
    pub full_path: String,
    pub token: Option<String>,
    pub headers: Vec<HeaderField>,
    pub sha256: Option<ByteBuf>,
    pub index: usize,
    pub encoding_type: EncodingType,
    pub memory: Memory,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct StreamingCallbackHttpResponse {
    pub body: Blob,
    pub token: Option<StreamingCallbackToken>,
}
