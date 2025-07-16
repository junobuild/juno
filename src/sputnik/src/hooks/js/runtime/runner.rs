use crate::hooks::js::types::hooks::JsHookContext;
use crate::js::constants::{DEV_MODULE_NAME, HOOKS_MODULE_NAME};
use crate::js::module::engine::{evaluate_async_module, evaluate_module};
use rquickjs::IntoJs;
use rquickjs::{Ctx, Error as JsError};

pub fn make_loader_code(assertion: &str, loader: &str) -> String {
    format!(
        r#"const {{ {assertion} }} = await import("{}");

            if (typeof {assertion} !== 'undefined') {{
                const config = typeof {assertion} === 'function' ? {assertion}({{}}) : {assertion};
                {loader}(config.collections);
            }}
            "#,
        DEV_MODULE_NAME,
        assertion = assertion,
        loader = loader
    )
}

pub fn execute_assertion<'js>(
    ctx: &Ctx<'js>,
    js_context: JsHookContext<'js, impl IntoJs<'js>>,
    assertion: &str,
) -> Result<(), JsError> {
    let js_obj = js_context.into_js(ctx)?;

    ctx.globals().set("jsContext", js_obj)?;

    let code = format!(
        r#"const {{ {assertion} }} = await import("{}");

            if (typeof {assertion} !== 'undefined') {{
                const config = typeof {assertion} === 'function' ? {assertion}({{}}) : {assertion};
                config.assert(jsContext);
            }}
            "#,
        DEV_MODULE_NAME,
        assertion = assertion,
    );

    evaluate_module(ctx, HOOKS_MODULE_NAME, &code)
}

pub async fn execute_hook<'js>(
    ctx: &Ctx<'js>,
    js_context: JsHookContext<'js, impl IntoJs<'js>>,
    hook: &str,
) -> Result<(), JsError> {
    let js_obj = js_context.into_js(ctx)?;

    ctx.globals().set("jsContext", js_obj)?;

    let code = format!(
        r#"const {{ {hook} }} = await import("{}");

        if (typeof {hook} !== 'undefined') {{
            const config = typeof {hook} === 'function' ? {hook}({{}}) : {hook};
            await config.run(jsContext);
        }}
        "#,
        DEV_MODULE_NAME,
        hook = hook,
    );

    evaluate_async_module(ctx, HOOKS_MODULE_NAME, &code).await
}
