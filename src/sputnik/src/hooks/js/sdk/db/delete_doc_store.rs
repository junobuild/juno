use crate::hooks::js::types::hooks::{JsCollectionKey, JsKey, JsUserId};
use crate::hooks::js::types::interface::JsDelDoc;
use junobuild_satellite::delete_doc_store as delete_doc_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_delete_doc_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_datastore_delete_doc_store",
        js_delete_doc_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn delete_doc_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    key: JsKey,
    value: JsDelDoc,
) -> JsResult<()> {
    delete_doc_store_sdk(caller.to_principal()?, collection, key, value.to_doc()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    Ok(())
}
