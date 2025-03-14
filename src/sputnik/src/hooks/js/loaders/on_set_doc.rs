use rquickjs::{Ctx, Error as JsError, Result as JsResult};
use crate::state::store::set_on_set_docs_collections;

pub fn init_on_set_doc_loader(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_satellite_on_set_doc_loader", js_on_set_doc_loader)?;

    Ok(())
}

#[rquickjs::function]
fn on_set_doc_loader<'js>(_ctx: Ctx<'js>, collections: Vec<String>) -> JsResult<()> {
    set_on_set_docs_collections(&collections);

    Ok(())
}
