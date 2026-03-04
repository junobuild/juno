use crate::functions::runner::types::{JsCustomFunction, JsCustomFunctionSync};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use crate::js::types::candid::JsUint8Array;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::{Ctx, Error as JsError};

pub struct CustomFunction {
    pub name: String,
}

impl JsCustomFunction for CustomFunction {
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

impl<A: IntoJsonData, R: FromJsonData> JsCustomFunctionSync<A, R> for CustomFunction {
    fn execute<'js>(&self, ctx: &Ctx<'js>, args: A) -> Result<R, JsError> {
        let bytes = args
            .into_json_data()
            .map_err(|e| JsError::new_from_js_message("Candid", "JsonData", e.to_string()))?;
        let raw = JsUint8Array::from_bytes(ctx, &bytes)?;

        ctx.globals().set("jsContext", raw)?;

        let code = &self.get_code();

        evaluate_module(ctx, "@junobuild/sputnik/functions", code)?;

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
