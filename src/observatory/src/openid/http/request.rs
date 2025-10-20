use crate::openid::http::constants::FETCH_MAX_RESPONSE_BYTES;
use crate::types::state::OpenIdProvider;
use ic_cdk::management_canister::{
    http_request as http_request_outcall, HttpRequestArgs, TransformContext, TransformFunc,
};
use ic_cdk::management_canister::{HttpHeader, HttpMethod};
use junobuild_shared::ic::api::id;

type RawJsonValue = Vec<u8>;

pub async fn get_certificate(provider: &OpenIdProvider) -> Result<RawJsonValue, String> {
    let request = get_request(provider);

    match http_request_outcall(&request).await {
        Ok(response) => Ok(response.body),
        Err(error) => {
            let message = format!("HTTP request error: {error:?}");
            Err(format!("‼️ --> {message}."))
        }
    }
}

fn get_request(provider: &OpenIdProvider) -> HttpRequestArgs {
    let url = provider.jwks_url();

    let request_headers = vec![
        HttpHeader {
            name: "Accept".into(),
            value: "application/json".into(),
        },
        HttpHeader {
            name: "User-Agent".into(),
            value: "juno_observatory".into(),
        },
    ];

    HttpRequestArgs {
        url: url.to_string(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(FETCH_MAX_RESPONSE_BYTES),
        transform: param_transform(),
        headers: request_headers,
    }
}

fn param_transform() -> Option<TransformContext> {
    Some(TransformContext {
        function: TransformFunc(candid::Func {
            principal: id(),
            method: "transform_certificate_response".to_string(),
        }),
        context: vec![],
    })
}
