use junobuild_satellite::{
    caller_has_write_permission as caller_has_write_permission_sdk,
    caller_is_access_key as caller_is_access_key_sdk, caller_is_admin as caller_is_admin_sdk,
};
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_guards_sdk(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_satellite_caller_is_admin", js_caller_is_admin)?;
    global.set(
        "__juno_satellite_caller_has_write_permission",
        js_caller_has_write_permission,
    )?;
    global.set(
        "__juno_satellite_caller_is_access_key",
        js_caller_is_access_key,
    )?;

    Ok(())
}

#[rquickjs::function]
fn caller_is_admin<'js>(ctx: Ctx<'js>) -> JsResult<()> {
    caller_is_admin_sdk().map_err(|e| Exception::throw_message(&ctx, &e))
}

#[rquickjs::function]
fn caller_has_write_permission<'js>(ctx: Ctx<'js>) -> JsResult<()> {
    caller_has_write_permission_sdk().map_err(|e| Exception::throw_message(&ctx, &e))
}

#[rquickjs::function]
fn caller_is_access_key<'js>(ctx: Ctx<'js>) -> JsResult<()> {
    caller_is_access_key_sdk().map_err(|e| Exception::throw_message(&ctx, &e))
}
