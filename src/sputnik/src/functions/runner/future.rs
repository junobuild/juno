use crate::functions::runner::types::{JsCustomFunction, JsCustomFunctionAsync};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_async_module;
use crate::js::types::candid::JsUint8Array;
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
    async fn execute<'js>(&self, ctx: &Ctx<'js>, args: Option<A>) -> Result<R, JsError> {
        if let Some(args) = args {
            let bytes = args
                .into_json_data()
                .map_err(|e| JsError::new_from_js_message("Candid", "JsonData", e.to_string()))?;
            let raw = JsUint8Array::from_bytes(ctx, &bytes)?;

            ctx.globals().set("jsContext", raw)?;
        } else {
            ctx.globals().set("jsContext", rquickjs::Undefined)?;
        }

        let code = &self.get_code();

        evaluate_async_module(ctx, "@junobuild/sputnik/functions", &code).await?;

        let result: Option<JsUint8Array> = ctx.globals().get("jsResult")?;
        let result = result.ok_or(JsError::new_from_js_message(
            "jsResult",
            "JsUint8Array",
            "No result returned from JS",
        ))?;
        let bytes = result.to_bytes()?;

        R::from_json_data(bytes)
            .map_err(|e| JsError::new_from_js_message("JsonData", "Candid", e.to_string()))
    }
}
