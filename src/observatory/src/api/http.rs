use crate::certificates::http::response::transform_certificate_response as transform_certificate;
use crate::notification::http::response::transform_response;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk_macros::query;

#[query(hidden = true)]
fn transform(raw: TransformArgs) -> HttpResponse {
    transform_response(raw)
}

#[query(hidden = true)]
fn transform_certificate_response(raw: TransformArgs) -> HttpResponse {
    transform_certificate(raw)
}
