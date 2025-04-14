use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::hooks::JsKey;
use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
use junobuild_satellite::get_doc_store as get_doc_store_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_get_doc_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_satellite_datastore_get_doc_store", js_get_doc_store)?;

    Ok(())
}

#[rquickjs::function]
fn get_doc_store<'js>(
    ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    collection: JsCollectionKey,
    key: JsKey,
) -> JsResult<Option<JsDoc<'js>>> {
    let doc = get_doc_store_sdk(caller.to_principal()?, collection, key)
        .map_err(|e| Exception::throw_message(&ctx, &e))?;

    doc.map(|doc| JsDoc::from_doc(&ctx, doc)).transpose()
}
