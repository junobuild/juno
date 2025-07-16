use ic_cdk::print;
use rquickjs::{Ctx, Error as JsError, Result as JsResult, String};

pub fn init_ic_cdk_print(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();
    global.set("__ic_cdk_print", js_ic_cdk_print)?;

    Ok(())
}

#[rquickjs::function]
fn ic_cdk_print<'js>(_ctx: Ctx<'js>, msg: String<'js>) -> JsResult<()> {
    #[allow(clippy::disallowed_methods)]
    print(&msg.to_string()?);

    Ok(())
}
