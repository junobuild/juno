use crate::functions::runner::context::{get_result, set_args};
use crate::functions::runner::types::{JsCustomFunction, JsCustomFunctionSync};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::{Ctx, Error as JsError};

pub struct CustomFunctionSync {
    pub name: String,
}

impl JsCustomFunction for CustomFunctionSync {
    fn get_code(&self) -> String {
        format!(
            r#"const {{ {name} }} = await import("{DEV_MODULE_NAME}");

            if (typeof {name} !== 'undefined') {{
                const config = typeof {name} === 'function' ? {name}({{}}) : {name};
                __juno_invoke_endpoint(config, jsContext);
            }}
            "#,
            name = self.name
        )
    }
}

impl<A: IntoJsonData, R: FromJsonData> JsCustomFunctionSync<A, R> for CustomFunctionSync {
    fn execute<'js>(&self, ctx: &Ctx<'js>, args: Option<A>) -> Result<Option<R>, JsError> {
        set_args(ctx, args)?;

        let code = &self.get_code();

        evaluate_module(ctx, "@junobuild/sputnik/functions", code)?;

        get_result(ctx)
    }
}
