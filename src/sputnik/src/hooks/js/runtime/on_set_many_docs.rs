use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use crate::js::constants::{DEV_MODULE_NAME, HOOKS_MODULE_NAME};
use crate::js::module::engine::evaluate_async_module;
use junobuild_satellite::OnSetManyDocsContext;
use rquickjs::{Ctx, Error as JsError, IntoJs};

pub struct OnSetManyDocs;

// TODO: refactor duplicate code

impl JsHook for OnSetManyDocs {
    fn get_loader_code(&self) -> String {
        format!(
            r#"const {{ onSetManyDocs }} = await import("{}");

            if (typeof onSetManyDocs !== 'undefined') {{
                const config = typeof onSetManyDocs === 'function' ? onSetManyDocs({{}}) : onSetManyDocs;
                __juno_satellite_on_set_many_docs_loader(config.collections);
            }}
            "#,
            DEV_MODULE_NAME
        )
    }
}

impl OnJsHook<OnSetManyDocsContext> for OnSetManyDocs {
    async fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: OnSetManyDocsContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_set_many_docs(context, ctx)?;
        let js_obj = js_context.into_js(ctx)?;

        ctx.globals().set("jsContext", js_obj)?;

        let code = format!(
            r#"const {{ onSetManyDocs }} = await import("{}");

            if (typeof onSetManyDocs !== 'undefined') {{
                const config = typeof onSetManyDocs === 'function' ? onSetManyDocs({{}}) : onSetManyDocs;
                await config.run(jsContext);
            }}
            "#,
            DEV_MODULE_NAME
        );

        evaluate_async_module(ctx, HOOKS_MODULE_NAME, &code).await
    }
}
