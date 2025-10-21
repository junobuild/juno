use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};

pub fn transform_post_email(raw: TransformArgs) -> HttpRequestResult {
    HttpRequestResult {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        headers: vec![],
    }
}
