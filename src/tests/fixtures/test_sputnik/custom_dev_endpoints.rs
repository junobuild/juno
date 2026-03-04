use candid::{CandidType, Principal};
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::execute_sync_js;
use junobuild_shared::ic::UnwrapOrTrap;
use serde::{Serialize, Deserialize};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use crate::js::types::candid::JsUint8Array;
use junobuild_macros::JsonData;

// Input must be a struct
#[derive(CandidType, Serialize, Deserialize, JsonData)]
pub struct InputArgs {
    value: Principal,
}

// Output must be a struct
#[derive(CandidType, Serialize, Deserialize, JsonData)]
pub struct OutputArgs {
    value: Principal,
    text: String,
}

// We require or use a prefix to avoid clashes?
#[ic_cdk::query]
fn app_hello_world(input: InputArgs) -> OutputArgs {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        let bytes = input.into_json_data().map_err(|e| e.to_string())?;
        let raw = JsUint8Array::from_bytes(ctx, &bytes).map_err(|e| e.to_string())?;

        ctx.globals().set("jsContext", raw).map_err(|e| e.to_string())?;

        let custom_function: &str = "hello_world";

        let code = format!(
            r#"const {{ {custom_function} }} = await import("{DEV_MODULE_NAME}");

            if (typeof {custom_function} !== 'undefined') {{
                const config = typeof {custom_function} === 'function' ? {custom_function}({{}}) : {custom_function};
                __juno_invoke_endpoint(config, jsContext);
            }}
            "#,
        );

        evaluate_module(ctx, "@junobuild/sputnik/functions", &code).map_err(|e| e.to_string())?;

        let result: Option<JsUint8Array> = ctx.globals().get("jsResult").map_err(|e| e.to_string())?;
        let result = result.ok_or("No result returned from JS".to_string())?;

        let bytes = result.to_bytes().map_err(|e| e.to_string())?;
        let output = OutputArgs::from_json_data(bytes).map_err(|e| e.to_string())?;

        Ok(output)
    }).unwrap_or_trap()
}