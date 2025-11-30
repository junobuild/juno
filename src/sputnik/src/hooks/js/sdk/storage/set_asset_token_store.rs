use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use crate::hooks::js::types::storage::{JsAssetAccessToken, JsFullPath};
use junobuild_satellite::set_asset_token_store as set_asset_token_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_set_asset_token_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_set_asset_token_store",
        js_set_asset_token_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn set_asset_token_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    full_path: JsFullPath,
    token: JsAssetAccessToken,
) -> JsResult<()> {
    set_asset_token_store_sdk(caller.to_principal()?, &collection, &full_path, &token)
        .map_err(|e| Exception::throw_message(&ctx, &e))
}
