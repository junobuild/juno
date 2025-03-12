use crate::hooks::js::runtime::types::{AssertJsHook, JsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use crate::js::constants::{DEV_MODULE_NAME, HOOKS_MODULE_NAME};
use crate::js::module::engine::evaluate_module;
use junobuild_satellite::AssertSetDocContext;
use rquickjs::IntoJs;
use rquickjs::{Ctx, Error as JsError};

pub struct AssertSetDoc;

impl JsHook for AssertSetDoc {
    fn get_loader_code(&self) -> String {
        format!(
            r#"const {{ assertSetDoc }} = await import("{}");

            if (typeof assertSetDoc !== 'undefined') {{
                const config = typeof assertSetDoc === 'function' ? assertSetDoc({{}}) : assertSetDoc;

                console.log('assertSetDoc', config, typeof assertSetDoc === 'function');

                __juno_assert_set_doc_loader(config.collections);
            }} else {{
                console.log("assertSetDoc is not defined");
            }}
            "#,
            DEV_MODULE_NAME
        )
    }
}

impl AssertJsHook<AssertSetDocContext> for AssertSetDoc {
    fn execute<'js>(&self, ctx: &Ctx<'js>, context: AssertSetDocContext) -> Result<(), JsError> {
        let js_context = JsHookContext::from_assert_set_doc(context, ctx)?;
        let js_obj = js_context.into_js(ctx)?;

        ctx.globals().set("jsContext", js_obj)?;

        let code = format!(
            r#"const {{ assertSetDoc }} = await import("{}");

            if (typeof assertSetDoc !== 'undefined') {{
                const config = typeof assertSetDoc === 'function' ? assertSetDoc({{}}) : assertSetDoc;

                config.assertSetDoc(jsContext);
            }} else {{
                console.log("assertSetDoc is not defined");
            }}
            "#,
            DEV_MODULE_NAME
        );

        evaluate_module(ctx, HOOKS_MODULE_NAME, &code)
    }
}
