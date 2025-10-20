use crate::certificate::http::response::transform_certificate_response as transform_certificate;
use crate::notification::http::response::transform_response;
use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};
use ic_cdk_macros::query;

#[query(hidden = true)]
fn transform(raw: TransformArgs) -> HttpRequestResult {
    transform_response(raw)
}

#[query(hidden = true)]
fn transform_certificate_response(raw: TransformArgs) -> HttpRequestResult {
    transform_certificate(raw)
}
