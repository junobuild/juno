use crate::errors::js::JUNO_SPUTNIK_ERROR_IC_CDK_HTTP_REQUEST;
use crate::js::apis::types::http_request::{JsHttpRequestArgs, JsHttpRequestResult};
use crate::js::inner_utils::throw_js_exception;
use ic_cdk::management_canister::http_request;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_ic_cdk_http_request(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__ic_cdk_http_request", js_ic_cdk_http_request)?;

    Ok(())
}

#[rquickjs::function]
async fn ic_cdk_http_request<'js>(
    ctx: Ctx<'js>,
    args: JsHttpRequestArgs<'js>,
) -> JsResult<JsHttpRequestResult<'js>> {


    ic_cdk::api::debug_print(format!("http_request args url: {}", args.url));
    
    let result = http_request(&args.to_args()?).await;

    match result {
        Err(err) => Err(throw_js_exception(
            &ctx,
            JUNO_SPUTNIK_ERROR_IC_CDK_HTTP_REQUEST,
            err,
        )),
        Ok(result) => JsHttpRequestResult::from_result(&ctx, &result),
    }
}
