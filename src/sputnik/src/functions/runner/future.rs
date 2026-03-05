use crate::functions::runner::context::{get_result, set_args};
use crate::functions::runner::types::{JsCustomFunction, JsCustomFunctionAsync};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_async_module;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::{Ctx, Error as JsError};

pub struct CustomFunctionAsync {
    pub name: String,
}

impl JsCustomFunction for CustomFunctionAsync {
    fn get_code(&self) -> String {
        format!(
            r#"const {{ {name} }} = await import("{DEV_MODULE_NAME}");

            if (typeof {name} !== 'undefined') {{
                const config = typeof {name} === 'function' ? {name}({{}}) : {name};
                await __juno_invoke_endpoint_async(config, jsContext);
            }}
            "#,
            name = self.name
        )
    }
}

impl<A: IntoJsonData, R: FromJsonData> JsCustomFunctionAsync<A, R> for CustomFunctionAsync {
    async fn execute<'js>(&self, ctx: &Ctx<'js>, args: Option<A>) -> Result<Option<R>, JsError> {
        set_args(ctx, args)?;

        let code = &self.get_code();

        evaluate_async_module(ctx, "@junobuild/sputnik/functions", &code).await?;

        get_result(ctx)
    }
}
