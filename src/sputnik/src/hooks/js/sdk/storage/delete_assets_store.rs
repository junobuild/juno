use crate::hooks::js::types::shared::JsCollectionKey;
use junobuild_satellite::delete_assets_store as delete_assets_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_assets_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_delete_assets_store",
        js_delete_assets_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn delete_assets_store<'js>(ctx: Ctx<'js>, collection: JsCollectionKey) -> JsResult<()> {
    delete_assets_store_sdk(&collection).map_err(|e| Exception::throw_message(&ctx, &e))?;

    Ok(())
}
