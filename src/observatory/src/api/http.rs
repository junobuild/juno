use crate::notifications::http::response::transform_response;
use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};
use ic_cdk_macros::query;

#[query(hidden = true)]
fn transform(raw: TransformArgs) -> HttpRequestResult {
    transform_response(raw)
}
