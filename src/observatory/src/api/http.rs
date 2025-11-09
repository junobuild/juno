use crate::notifications::http::response::transform_post_email as transform_email;
use crate::openid::http::response::transform_certificate_response as transform_certificate;
use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};
use ic_cdk_macros::query;

#[query(hidden = true)]
fn transform_post_email(raw: TransformArgs) -> HttpRequestResult {
    transform_email(raw)
}

#[query(hidden = true)]
fn transform_certificate_response(raw: TransformArgs) -> HttpRequestResult {
    transform_certificate(raw)
}
