use crate::hooks::js::types::shared::JsCollectionKey;
use crate::js::types::primitives::JsUsize;
use junobuild_satellite::count_collection_docs_store as count_collection_docs_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_count_collection_docs_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_count_collection_docs_store",
        js_count_collection_docs_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn count_collection_docs_store<'js>(
    ctx: Ctx<'js>,
    collection: JsCollectionKey,
) -> JsResult<JsUsize> {
    let count = count_collection_docs_store_sdk(&collection)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;
    Ok(JsUsize(count))
}
