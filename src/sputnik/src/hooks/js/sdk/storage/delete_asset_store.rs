use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use crate::hooks::js::types::storage::{JsAsset, JsFullPath};
use junobuild_satellite::delete_asset_store as delete_asset_store_sdk;
use junobuild_storage::types::store::Asset;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_asset_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_delete_asset_store",
        js_delete_asset_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn delete_asset_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    full_path: JsFullPath,
) -> JsResult<Option<JsAsset<'js>>> {
    let asset = delete_asset_store_sdk(caller.to_principal()?, &collection, full_path)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    fn from_optional_asset<'js>(
        ctx: &Ctx<'js>,
        asset: Option<Asset>,
    ) -> JsResult<Option<JsAsset<'js>>> {
        asset
            .map(|asset| JsAsset::from_asset(ctx, asset))
            .transpose()
    }

    from_optional_asset(&ctx, asset)
}
