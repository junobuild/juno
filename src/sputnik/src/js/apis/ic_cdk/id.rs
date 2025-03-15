use anyhow::Result;
use ic_cdk::id;
use rquickjs::{Ctx, Error as JsError, Result as JsResult, TypedArray};

pub fn init_ic_cdk_id(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();
    global.set("__ic_cdk_id", js_ic_cdk_id)?;

    Ok(())
}

#[rquickjs::function]
fn ic_cdk_id<'js>(ctx: Ctx<'js>) -> JsResult<TypedArray<'js, u8>> {
    TypedArray::new(ctx, id().as_slice())
}
