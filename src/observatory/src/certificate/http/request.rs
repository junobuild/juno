use crate::certificate::http::constants::FETCH_CERTIFICATE_CYCLES;
use crate::types::state::OpenIdProvider;
use ic_cdk::api::management_canister::http_request::{
    http_request as http_request_outcall, TransformContext, TransformFunc,
};
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use junobuild_shared::ic::api::id;

type RawJsonValue = Vec<u8>;

pub async fn get_certificate(provider: &OpenIdProvider) -> Result<RawJsonValue, String> {
    let request = get_request(provider);

    match http_request_outcall(request, FETCH_CERTIFICATE_CYCLES).await {
        Ok((response,)) => Ok(response.body),
        Err((r, m)) => {
            let message = format!("HTTP request error. RejectionCode: {r:?}, Error: {m}");
            Err(format!("‼️ --> {message}."))
        }
    }
}

fn get_request(provider: &OpenIdProvider) -> CanisterHttpRequestArgument {
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

    CanisterHttpRequestArgument {
        url: url.to_string(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: None,
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
