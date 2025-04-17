use crate::hooks::js::types::list::JsListParams;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use crate::hooks::js::types::storage::JsAsset;
use junobuild_satellite::delete_filtered_assets_store as delete_filtered_assets_store_sdk;
use junobuild_storage::types::store::Asset;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_filtered_assets_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_delete_filtered_assets_store",
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

    fn from_optional_assets<'js>(
        ctx: &Ctx<'js>,
        assets: Vec<Option<Asset>>,
    ) -> JsResult<Vec<Option<JsAsset<'js>>>> {
        assets
            .into_iter()
            .map(|asset_option| {
                asset_option
                    .map(|asset| JsAsset::from_asset(ctx, asset))
                    .transpose()
            })
            .collect()
    }

    from_optional_assets(&ctx, assets)
}
