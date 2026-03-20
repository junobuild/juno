use crate::sdk::js::types::shared::{JsAccessKeys, JsUserId};
use junobuild_satellite::{
    get_access_keys as get_access_keys_sdk, get_admin_access_keys as get_admin_access_keys_sdk,
};
use junobuild_shared::segments::access_keys::{
    check_caller_can_write as is_controller_sdk, is_admin_controller as is_admin_controller_sdk,
};
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_access_keys_sdk(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_admin_access_keys",
        js_get_admin_access_keys,
    )?;
    global.set("__juno_satellite_get_access_keys", js_get_access_keys)?;

    global.set(
        "__juno_satellite_is_admin_controller",
        js_is_admin_controller,
    )?;
    global.set("__juno_satellite_is_controller", js_is_controller)?;

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

#[rquickjs::function]
fn is_admin_controller<'js>(
    _ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    controllers: JsAccessKeys<'js>,
) -> JsResult<bool> {
    let result = is_admin_controller_sdk(caller.to_principal()?, &controllers.to_access_keys()?);
    Ok(result)
}

#[rquickjs::function]
fn is_controller<'js>(
    _ctx: Ctx<'js>,
    caller: JsUserId<'js>,
    controllers: JsAccessKeys<'js>,
) -> JsResult<bool> {
    let result = is_controller_sdk(caller.to_principal()?, &controllers.to_access_keys()?);
    Ok(result)
}
