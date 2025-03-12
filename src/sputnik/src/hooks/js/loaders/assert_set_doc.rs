use crate::state::store::set_assert_set_docs_collections;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_assert_set_doc_loader(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_assert_set_doc_loader", js_assert_set_doc_loader)?;

    Ok(())
}

#[rquickjs::function]
fn assert_set_doc_loader<'js>(_ctx: Ctx<'js>, collections: Vec<String>) -> JsResult<()> {
    set_assert_set_docs_collections(&collections);

    Ok(())
}
