use crate::hooks::js::types::storage::{JsAssetKey, JsBlob, JsHeaderFields};
use junobuild_satellite::set_asset_handler as set_asset_handler_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_set_asset_handler(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_set_asset_handler",
        js_set_asset_handler,
    )?;

    Ok(())
}

#[rquickjs::function]
fn set_asset_handler<'js>(
    ctx: Ctx<'js>,
    key: JsAssetKey<'js>,
    content: JsBlob<'js>,
    headers: JsHeaderFields,
) -> JsResult<()> {
    set_asset_handler_sdk(
        &key.to_asset_key()?,
        &content.to_bytes()?.to_vec(),
        &headers.to_header_fields(),
    )
    .map_err(|e| Exception::throw_message(&ctx, &e))
}
