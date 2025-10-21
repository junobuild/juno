use crate::openid::http::constants::FETCH_MAX_RESPONSE_BYTES;
use crate::types::state::OpenIdProvider;
use ic_cdk::management_canister::{
    http_request as http_request_outcall, HttpRequestArgs, HttpRequestResult, TransformContext,
    TransformFunc,
};
use ic_cdk::management_canister::{HttpHeader, HttpMethod};
use junobuild_shared::ic::api::id;

pub async fn get_certificate(provider: &OpenIdProvider) -> Result<HttpRequestResult, String> {
    let request = get_request(provider);

    let response = http_request_outcall(&request)
        .await
        .map_err(|error| format!("‼️ --> HTTP request failed: {error:?}."))?;

    let status_code = match u64::try_from(&response.status.0) {
        Ok(status) => status,
        Err(_) => {
            return Err(format!(
                "‼️ --> Invalid HTTP status type returned from {}: {:?}",
                provider, response.status
            ));
        }
    };

    if !(200..300).contains(&status_code) {
        return Err(format!(
            "‼️ --> HTTP request unexpected status code: {} from {}",
            status_code,
            provider
        ));
    }

    Ok(response)
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
