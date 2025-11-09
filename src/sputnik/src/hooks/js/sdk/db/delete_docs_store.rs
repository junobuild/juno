use crate::hooks::js::types::shared::JsCollectionKey;
use junobuild_satellite::delete_docs_store as delete_docs_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_docs_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_delete_docs_store",
        js_delete_docs_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn delete_docs_store<'js>(ctx: Ctx<'js>, collection: JsCollectionKey) -> JsResult<()> {
    delete_docs_store_sdk(&collection).map_err(|e| Exception::throw_message(&ctx, &e))?;

    Ok(())
}
