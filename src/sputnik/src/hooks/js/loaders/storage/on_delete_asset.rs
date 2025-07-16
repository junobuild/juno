use crate::state::store::set_on_delete_asset_collections;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_on_delete_asset_loader(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_on_delete_asset_loader",
        js_on_delete_asset_loader,
    )?;

    Ok(())
}

#[rquickjs::function]
fn on_delete_asset_loader<'js>(_ctx: Ctx<'js>, collections: Vec<String>) -> JsResult<()> {
    set_on_delete_asset_collections(&collections);

    Ok(())
}
