use crate::hooks::js::types::hooks::{JsCollectionKey, JsKey, JsUserId};
use crate::hooks::js::types::interface::JsSetDoc;
use junobuild_satellite::set_doc_store as set_doc_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_db_sdk(ctx: &Ctx) -> Result<(), JsError> {
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
) -> JsResult<()> {
    set_doc_store_sdk(caller.to_principal()?, collection, key, value.to_doc()?)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    Ok(())
}
