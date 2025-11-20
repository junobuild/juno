use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};
use ic_cdk::trap;

const HTTP_STATUS_OK: u8 = 200;

pub fn transform_post_email(raw: TransformArgs) -> HttpRequestResult {
    let response = raw.response;

    if response.status != HTTP_STATUS_OK {
        trap(format!("Invalid HTTP status code: {:?}", response.status));
    }

    HttpRequestResult {
        status: response.status.clone(),
        body: response.body.clone(),
        headers: vec![],
    }
}
