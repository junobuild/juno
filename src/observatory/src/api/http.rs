use crate::http::response::transform_response;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk_macros::query;

#[query(hidden = true)]
fn transform(raw: TransformArgs) -> HttpResponse {
    transform_response(raw)
}

// TODO: transform_openid_certificate
