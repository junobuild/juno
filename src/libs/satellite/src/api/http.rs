use crate::assets::storage::strategy_impls::StorageState;
use crate::certification::strategy_impls::StorageCertificate;
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::http_request::{
    http_request as http_request_storage,
    http_request_streaming_callback as http_request_streaming_callback_storage,
};

// ---------------------------------------------------------
// Http
// ---------------------------------------------------------

pub fn http_request(request: HttpRequest) -> HttpResponse {
    http_request_storage(request, &StorageState, &StorageCertificate)
}

pub fn http_request_streaming_callback(
    streaming_callback_token: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    http_request_streaming_callback_storage(streaming_callback_token, &StorageState)
}
