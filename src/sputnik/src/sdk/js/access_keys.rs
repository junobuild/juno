use crate::sdk::js::types::shared::JsAccessKeys;
use junobuild_satellite::{
    get_access_keys as get_access_keys_sdk, get_admin_access_keys as get_admin_access_keys_sdk,
};
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_access_keys_sdk(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_get_admin_access_keys",
        js_get_admin_access_keys,
    )?;
    global.set("__juno_satellite_get_access_keys", js_get_access_keys)?;

    Ok(())
}

#[rquickjs::function]
fn get_admin_access_keys<'js>(ctx: Ctx<'js>) -> JsResult<JsAccessKeys<'js>> {
    let access_keys = get_admin_access_keys_sdk();
    JsAccessKeys::from_access_keys(&ctx, access_keys)
}

#[rquickjs::function]
fn get_access_keys<'js>(ctx: Ctx<'js>) -> JsResult<JsAccessKeys<'js>> {
    let access_keys = get_access_keys_sdk();
    JsAccessKeys::from_access_keys(&ctx, access_keys)
}
