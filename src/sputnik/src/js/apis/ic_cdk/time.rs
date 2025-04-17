use anyhow::Result;
use ic_cdk::api::time;
use rquickjs::{BigInt, Ctx, Error as JsError, Result as JsResult};
use crate::js::utils::primitives::into_bigint_js;

pub fn init_ic_cdk_time(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();
    global.set("__ic_cdk_time", js_ic_cdk_time)?;

    Ok(())
}

#[rquickjs::function]
fn ic_cdk_time<'js>(ctx: Ctx<'js>) -> JsResult<BigInt<'js>> {
    into_bigint_js(&ctx, time())
}
