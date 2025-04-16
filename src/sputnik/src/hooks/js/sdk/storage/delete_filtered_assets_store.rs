use crate::hooks::js::types::list::JsListParams;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use crate::hooks::js::types::storage::JsAsset;
use junobuild_satellite::delete_filtered_assets_store as delete_filtered_assets_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_filtered_assets_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_delete_filtered_assets_store",
        js_delete_filtered_assets_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn delete_filtered_assets_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    filter: JsListParams<'js>,
) -> JsResult<Vec<Option<JsAsset<'js>>>> {
    let assets =
        delete_filtered_assets_store_sdk(caller.to_principal()?, collection, &filter.to_params()?)
            .map_err(|e| Exception::throw_message(&ctx, &e))?;

    assets
        .into_iter()
        .map(|opt_asset| {
            opt_asset
                .map(|asset| JsAsset::from_asset(&ctx, asset))
                .transpose()
        })
        .collect()
}
