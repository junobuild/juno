use rquickjs::{Ctx, Error as JsError, Result as JsResult, Function as JsFunction};
use ic_cdk::management_canister::{http_request_with_closure, HttpMethod, HttpRequestArgs, HttpRequestResult};
use crate::js::types::candid::JsHttpRequestResult;

pub fn init_ic_cdk_http_request(ctx: &Ctx) -> anyhow::Result<(), JsError> {
    let global = ctx.globals();

    global.set("__ic_cdk_http_request", js_ic_cdk_http_request)?;

    Ok(())
}

#[rquickjs::function]
async fn ic_cdk_http_request<'js>(
    ctx: Ctx<'js>,
    transform: JsFunction<'js>,
) -> JsResult<()> {
    let request = HttpRequestArgs {
        url: "http://localhost:8000".to_string(),
        method: HttpMethod::POST,
        body: None,
        max_response_bytes: None,
        transform: None,
        headers: vec!(),
        is_replicated: Some(false),
    };

    let _ = http_request_with_closure(&request, move |response| {
        let js_response = JsHttpRequestResult::from_result(&ctx, response).unwrap();
        let transformed: JsHttpRequestResult = transform.call((js_response,)).unwrap();
        transformed.to_result().unwrap()
    }).await;

    Ok(())
}