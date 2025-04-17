use crate::hooks::js::types::interface::JsAssetNoContent;
use crate::hooks::js::types::list::{JsListParams, JsListResults};
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use junobuild_satellite::list_assets_store as list_assets_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_list_assets_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_list_assets_store",
        js_list_assets_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn list_assets_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    params: JsListParams<'js>,
) -> JsResult<JsListResults<JsAssetNoContent<'js>>> {
    let results = list_assets_store_sdk(caller.to_principal()?, &collection, &params.to_params()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    let mapped_results = JsListResults::from_asset_no_content_results(&ctx, &results)?;

    Ok(mapped_results)
}
