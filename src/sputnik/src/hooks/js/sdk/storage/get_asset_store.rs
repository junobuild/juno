use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use crate::hooks::js::types::storage::{JsAsset, JsFullPath};
use junobuild_satellite::get_asset_store as get_asset_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_get_asset_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_get_asset_store",
        js_get_asset_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn get_asset_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    full_path: JsFullPath,
) -> JsResult<Option<JsAsset<'js>>> {
    let asset = get_asset_store_sdk(caller.to_principal()?, &collection, full_path)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    asset
        .map(|asset| JsAsset::from_asset(&ctx, asset))
        .transpose()
}
