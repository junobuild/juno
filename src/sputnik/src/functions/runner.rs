use crate::hooks::js::sdk::init_sdk;
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use crate::js::runtime::execute_sync_js;
use crate::js::types::candid::JsUint8Array;
use junobuild_utils::{FromJsonData, IntoJsonData};

pub fn execute_custom_function<A: IntoJsonData, R: FromJsonData>(
    custom_function: &str,
    args: A,
) -> Result<R, String> {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        let bytes = args.into_json_data().map_err(|e| e.to_string())?;
        let raw = JsUint8Array::from_bytes(ctx, &bytes).map_err(|e| e.to_string())?;

        ctx.globals()
            .set("jsContext", raw)
            .map_err(|e| e.to_string())?;

        let code = format!(
            r#"const {{ {custom_function} }} = await import("{DEV_MODULE_NAME}");

            if (typeof {custom_function} !== 'undefined') {{
                const config = typeof {custom_function} === 'function' ? {custom_function}({{}}) : {custom_function};
                __juno_invoke_endpoint(config, jsContext);
            }}
            "#,
        );

        evaluate_module(ctx, "@junobuild/sputnik/functions", &code).map_err(|e| e.to_string())?;

        let result: Option<JsUint8Array> =
            ctx.globals().get("jsResult").map_err(|e| e.to_string())?;
        let result = result.ok_or("No result returned from JS".to_string())?;
        let bytes = result.to_bytes().map_err(|e| e.to_string())?;

        R::from_json_data(bytes).map_err(|e| e.to_string())
    })
}
