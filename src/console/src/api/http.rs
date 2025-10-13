use crate::cdn::strategies_impls::storage::StorageState;
use crate::certification::strategy_impls::StorageCertificate;
use ic_cdk_macros::query;
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::http_request::{
    http_request as http_request_storage,
    http_request_streaming_callback as http_request_streaming_callback_storage,
};

#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    http_request_storage(request, &StorageState, &StorageCertificate)
}

#[query]
pub fn http_request_streaming_callback(
    streaming_callback_token: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    http_request_streaming_callback_storage(streaming_callback_token, &StorageState)
}
