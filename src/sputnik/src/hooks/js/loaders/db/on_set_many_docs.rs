use crate::state::store::set_on_set_many_docs_collections;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_on_set_many_docs_loader(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_on_set_many_docs_loader",
        js_on_set_many_docs_loader,
    )?;

    Ok(())
}

#[rquickjs::function]
fn on_set_many_docs_loader<'js>(_ctx: Ctx<'js>, collections: Vec<String>) -> JsResult<()> {
    set_on_set_many_docs_collections(&collections);

    Ok(())
}
