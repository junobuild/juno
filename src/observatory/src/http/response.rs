use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};

pub fn transform_response(raw: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        headers: vec![],
    }
}
