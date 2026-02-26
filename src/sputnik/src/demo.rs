use candid::{CandidType, Principal};
use rquickjs::{Ctx, IntoJs, Object, Value, Result as JsResult};
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::execute_sync_js;
use junobuild_shared::ic::UnwrapOrTrap;
use serde::{Serialize, Deserialize};
use crate::js::constants::DEV_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use crate::js::types::candid::JsRawPrincipal;

#[derive(CandidType, Serialize, Deserialize)]
pub struct InputArgs {
    value: Principal,
}

struct JsInputArgs<'js> {
    value: JsRawPrincipal<'js>,
}

impl<'js> IntoJs<'js> for JsInputArgs<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        obj.set("value", self.value.into_js(ctx)?)?;

        Ok(obj.into_value())
    }
}

impl<'js> JsInputArgs<'js> {
    pub fn from(ctx: &Ctx<'js>, input: InputArgs) -> JsResult<Self> {
        Ok(Self {
            value: JsRawPrincipal::from_principal(ctx, &input.value)?,
        })
    }
}

#[ic_cdk::query]
fn world_world(input: InputArgs) {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        let input_args =  JsInputArgs::from(ctx, input).map_err(|e| e.to_string())?;

        ctx.globals().set("jsContext", input_args).map_err(|e| e.to_string())?;

        let custom_function: &str = "world_world";

        let code = format!(
            r#"const {{ {custom_function} }} = await import("{DEV_MODULE_NAME}");

            if (typeof {custom_function} !== 'undefined') {{
                const config = typeof {custom_function} === 'function' ? {custom_function}({{}}) : {custom_function};
                config.handler(jsContext);
            }}
            "#,
        );

        evaluate_module(ctx, "@junobuild/sputnik/functions", &code).map_err(|e| e.to_string())?;

        Ok(())
    }).unwrap_or_trap()
}