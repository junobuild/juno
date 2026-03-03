use candid::{CandidType, Principal};
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::execute_sync_js;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_utils::{encode_doc_data};
use serde::{Serialize, Deserialize};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use crate::js::types::candid::JsUint8Array;
use junobuild_macros::FunctionData;

// Input must be a struct
#[derive(CandidType, Serialize, Deserialize, FunctionData)]
pub struct InputArgs {
    value: Principal,
}

#[ic_cdk::query]
fn hello_world(input: InputArgs) {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        let bytes = encode_doc_data(&input.into_doc_data()).map_err(|e| e.to_string())?;
        let raw = JsUint8Array::from_bytes(ctx, &bytes).map_err(|e| e.to_string())?;

        ctx.globals().set("jsContext", raw).map_err(|e| e.to_string())?;

        let custom_function: &str = "hello_world";

        let code = format!(
            r#"const {{ {custom_function} }} = await import("{DEV_MODULE_NAME}");

            console.log('=====', jsContext);

            if (typeof {custom_function} !== 'undefined') {{
                const config = typeof {custom_function} === 'function' ? {custom_function}({{}}) : {custom_function};
                __juno_invoke_endpoint(config, jsContext);
            }}
            "#,
        );

        evaluate_module(ctx, "@junobuild/sputnik/functions", &code).map_err(|e| e.to_string())?;

        Ok(())
    }).unwrap_or_trap()
}