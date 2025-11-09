use crate::hooks::js::types::list::JsListParams;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use crate::js::types::primitives::JsUsize;
use junobuild_satellite::count_docs_store as count_docs_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_count_docs_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_count_docs_store",
        js_count_docs_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn count_docs_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    filter: JsListParams<'js>,
) -> JsResult<JsUsize> {
    let count = count_docs_store_sdk(caller.to_principal()?, collection, &filter.to_params()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;
    Ok(JsUsize(count))
}
