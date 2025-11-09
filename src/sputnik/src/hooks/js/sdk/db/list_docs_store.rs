use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::list::{JsListParams, JsListResults};
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use junobuild_satellite::list_docs_store as list_docs_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_list_docs_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_list_docs_store",
        js_list_docs_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn list_docs_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    params: JsListParams<'js>,
) -> JsResult<JsListResults<JsDoc<'js>>> {
    let results = list_docs_store_sdk(caller.to_principal()?, collection, &params.to_params()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    let mapped_results = JsListResults::from_doc_results(&ctx, &results)?;

    Ok(mapped_results)
}
