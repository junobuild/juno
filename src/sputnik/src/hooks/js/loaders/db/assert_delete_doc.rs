use crate::state::store::set_assert_delete_doc_collections;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_assert_delete_doc_loader(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_assert_delete_doc_loader",
        js_assert_delete_doc_loader,
    )?;

    Ok(())
}

#[rquickjs::function]
fn assert_delete_doc_loader<'js>(_ctx: Ctx<'js>, collections: Vec<String>) -> JsResult<()> {
    set_assert_delete_doc_collections(&collections);

    Ok(())
}
