use crate::errors::js::JUNO_SPUTNIK_ERROR_IC_CDK_CALL_RAW;
use crate::js::types::candid::JsRawPrincipal;
use crate::js::utils::throw_js_exception;
use anyhow::Result;
use ic_cdk::api::call::call_raw;
use rquickjs::{Ctx, Error as JsError, Result as JsResult, String, TypedArray};

pub fn init_ic_cdk_call_raw(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__ic_cdk_call_raw", js_ic_cdk_call_raw)?;

    Ok(())
}

#[rquickjs::function]
async fn ic_cdk_call_raw<'js>(
    ctx: Ctx<'js>,
    canister_id: JsRawPrincipal<'js>,
    method: String<'js>,
    args: TypedArray<'js, u8>,
) -> JsResult<TypedArray<'js, u8>> {
    let id = canister_id.to_principal()?;

    let args_raw = args
        .as_bytes()
        .ok_or_else(|| JsError::new_from_js("TypedArray", "RawBytes"))?;

    let result = call_raw(id, &method.to_string()?, args_raw, 0).await;

    match result {
        Err(err) => Err(throw_js_exception(
            &ctx,
            JUNO_SPUTNIK_ERROR_IC_CDK_CALL_RAW,
            &format!("{}: {}", err.0 as i32, &err.1),
        )),
        Ok(bytes) => {
            let ok = TypedArray::<u8>::new(ctx.clone(), bytes)?;
            Ok(ok)
        }
    }
}
