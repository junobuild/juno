use crate::hooks::js::types::list::JsListParams;
use crate::hooks::js::types::primitives::JsUsize;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use junobuild_satellite::count_assets_store as count_assets_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_count_assets_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_count_assets_store",
        js_count_assets_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn count_assets_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    filter: JsListParams<'js>,
) -> JsResult<JsUsize> {
    let count = count_assets_store_sdk(caller.to_principal()?, &collection, &filter.to_params()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;
    Ok(JsUsize(count))
}
