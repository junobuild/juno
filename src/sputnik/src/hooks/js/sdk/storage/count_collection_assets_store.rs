use crate::hooks::js::types::shared::JsCollectionKey;
use crate::js::types::primitives::JsUsize;
use junobuild_satellite::count_collection_assets_store as count_collection_assets_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_count_collection_assets_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_count_collection_assets_store",
        js_count_collection_assets_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn count_collection_assets_store<'js>(
    ctx: Ctx<'js>,
    collection: JsCollectionKey,
) -> JsResult<JsUsize> {
    let count = count_collection_assets_store_sdk(&collection)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;
    Ok(JsUsize(count))
}
