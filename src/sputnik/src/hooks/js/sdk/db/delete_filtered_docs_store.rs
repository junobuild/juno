use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::hooks::JsDocContext;
use crate::hooks::js::types::list::JsListParams;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use junobuild_satellite::delete_filtered_docs_store as delete_filtered_docs_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_filtered_docs_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_delete_filtered_docs_store",
        js_delete_filtered_docs_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn delete_filtered_docs_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    filter: JsListParams<'js>,
) -> JsResult<Vec<JsDocContext<Option<JsDoc<'js>>>>> {
    let context =
        delete_filtered_docs_store_sdk(caller.to_principal()?, collection, &filter.to_params()?)
            .map_err(|e| Exception::throw_message(&ctx, &e))?;

    let js_context = JsDocContext::from_many_context_option_docs(&ctx, context)?;

    Ok(js_context)
}
