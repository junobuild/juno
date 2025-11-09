use junobuild_satellite::random as random_sdk;
use rquickjs::{Ctx, Error as JsError, Exception, Result as JsResult};

pub fn init_random_sdk(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_satellite_random", js_random)?;

    Ok(())
}

#[rquickjs::function]
fn random<'js>(ctx: Ctx<'js>) -> JsResult<i32> {
    random_sdk().map_err(|e| Exception::throw_message(&ctx, &e))
}
