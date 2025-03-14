use crate::hooks::js::types::hooks::{JsHookContext};
use crate::js::module::engine::{evaluate_async_module};
use junobuild_satellite::{OnSetDocContext};
use rquickjs::{Ctx, IntoJs, Error as JsError};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::js::constants::{DEV_MODULE_NAME, HOOKS_MODULE_NAME};

pub struct OnSetDoc;

impl JsHook for OnSetDoc {
    fn get_loader_code(&self) -> String {
        format!(
            r#"const {{ onSetDoc }} = await import("{}");

            if (typeof onSetDoc !== 'undefined') {{
                const config = typeof onSetDoc === 'function' ? onSetDoc({{}}) : onSetDoc;
                __juno_satellite_on_set_doc_loader(config.collections);
            }}
            "#,
            DEV_MODULE_NAME
        )
    }
}


impl OnJsHook<OnSetDocContext> for OnSetDoc {
    async fn execute<'js>(&self, ctx: &Ctx<'js>, context: OnSetDocContext) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_set_doc(context, ctx)?;
        let js_obj = js_context.into_js(ctx)?;

        ctx.globals().set("jsContext", js_obj)?;

        let code = format!(
            r#"const {{ onSetDoc }} = await import("{}");

            if (typeof onSetDoc !== 'undefined') {{
                const config = typeof onSetDoc === 'function' ? onSetDoc({{}}) : onSetDoc;
                await config.run(jsContext);
            }}
            "#,
            DEV_MODULE_NAME
        );

        evaluate_async_module(ctx, HOOKS_MODULE_NAME, &code).await
    }
}
