use crate::js::types::candid::JsRawPrincipal;
use anyhow::Result;
use junobuild_shared::ic::api::caller;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_ic_cdk_caller(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();
    global.set("__ic_cdk_caller", js_ic_cdk_caller)?;

    Ok(())
}

#[rquickjs::function]
fn ic_cdk_caller<'js>(ctx: Ctx<'js>) -> JsResult<JsRawPrincipal<'js>> {
    JsRawPrincipal::from_bytes(&ctx, caller().as_slice())
}
