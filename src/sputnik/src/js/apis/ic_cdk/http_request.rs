use crate::errors::js::{
    JUNO_SPUTNIK_ERROR_IC_CDK_CALL_RAW, JUNO_SPUTNIK_ERROR_IC_CDK_HTTP_REQUEST,
};
use crate::js::inner_utils::throw_js_exception;
use crate::js::types::candid::{JsCallRawResult, JsHttpRequestResult};
use ic_cdk::management_canister::{http_request, HttpMethod, HttpRequestArgs};
use rquickjs::{Ctx, Error as JsError, Function as JsFunction, Result as JsResult};

pub fn init_ic_cdk_http_request(ctx: &Ctx) -> anyhow::Result<(), JsError> {
    let global = ctx.globals();

    global.set("__ic_cdk_http_request", js_ic_cdk_http_request)?;

    Ok(())
}

#[rquickjs::function]
async fn ic_cdk_http_request<'js>(
    ctx: Ctx<'js>,
    transform: JsFunction<'js>,
) -> JsResult<JsHttpRequestResult> {
    let request = HttpRequestArgs {
        url: "http://localhost:8000".to_string(),
        method: HttpMethod::POST,
        body: None,
        max_response_bytes: None,
        transform: None,
        headers: vec![],
        is_replicated: Some(false),
    };

    let result = http_request(&request).await;

    match result {
        Err(err) => Err(throw_js_exception(
            &ctx,
            JUNO_SPUTNIK_ERROR_IC_CDK_HTTP_REQUEST,
            err,
        )),
        Ok(result) => JsHttpRequestResult::from_result(&ctx, &result),
    }
}
