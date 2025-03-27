use crate::hooks::js::runtime::types::{AssertJsHook, JsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use crate::js::constants::{DEV_MODULE_NAME, HOOKS_MODULE_NAME};
use crate::js::module::engine::evaluate_module;
use junobuild_satellite::AssertDeleteDocContext;
use rquickjs::IntoJs;
use rquickjs::{Ctx, Error as JsError};

pub struct AssertDeleteDoc;

// TODO: refactor duplicated code?

impl JsHook for AssertDeleteDoc {
    fn get_loader_code(&self) -> String {
        format!(
            r#"const {{ assertDeleteDoc }} = await import("{}");

            if (typeof assertDeleteDoc !== 'undefined') {{
                const config = typeof assertDeleteDoc === 'function' ? assertDeleteDoc({{}}) : assertDeleteDoc;
                __juno_satellite_assert_delete_doc_loader(config.collections);
            }}
            "#,
            DEV_MODULE_NAME
        )
    }
}

impl AssertJsHook<AssertDeleteDocContext> for AssertDeleteDoc {
    fn execute<'js>(&self, ctx: &Ctx<'js>, context: AssertDeleteDocContext) -> Result<(), JsError> {
        let js_context = JsHookContext::from_assert_delete_doc(context, ctx)?;
        let js_obj = js_context.into_js(ctx)?;

        ctx.globals().set("jsContext", js_obj)?;

        let code = format!(
            r#"const {{ assertDeleteDoc }} = await import("{}");

            if (typeof assertDeleteDoc !== 'undefined') {{
                const config = typeof assertDeleteDoc === 'function' ? assertDeleteDoc({{}}) : assertDeleteDoc;
                config.assert(jsContext);
            }}
            "#,
            DEV_MODULE_NAME
        );

        evaluate_module(ctx, HOOKS_MODULE_NAME, &code)
    }
}
