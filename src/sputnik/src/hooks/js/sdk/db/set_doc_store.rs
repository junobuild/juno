use crate::hooks::js::types::hooks::{JsDocContext, JsDocUpsert, JsKey};
use crate::hooks::js::types::interface::JsSetDoc;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use junobuild_satellite::set_doc_store as set_doc_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_set_doc_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_satellite_datastore_set_doc_store", js_set_doc_store)?;

    Ok(())
}

#[rquickjs::function]
fn set_doc_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    key: JsKey,
    value: JsSetDoc<'js>,
) -> JsResult<JsDocContext<JsDocUpsert<'js>>> {
    let context = set_doc_store_sdk(caller.to_principal()?, collection, key, value.to_doc()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    let js_context = JsDocContext::from_context_doc_upsert(&ctx, context)?;

    Ok(js_context)
}
