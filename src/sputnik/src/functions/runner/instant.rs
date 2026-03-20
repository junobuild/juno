use crate::functions::runner::context::{get_result, set_args};
use crate::functions::runner::types::{JsCustomFunction, JsCustomFunctionSync};
use crate::js::constants::{DEV_MODULE_NAME, FUNCTIONS_MODULE_NAME};
use crate::js::module::engine::evaluate_module;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::{Ctx, Error as JsError};

pub enum CustomFunctionSyncKind {
    Invoke,
    Guard,
}

impl CustomFunctionSyncKind {
    fn fn_name(&self) -> &str {
        match self {
            CustomFunctionSyncKind::Invoke => "__juno_satellite_fn_invoke_sync",
            CustomFunctionSyncKind::Guard => "__juno_satellite_fn_guard_sync",
        }
    }
}

pub struct CustomFunctionSync {
    pub name: String,
    pub kind: CustomFunctionSyncKind
}

impl JsCustomFunction for CustomFunctionSync {
    fn get_code(&self) -> String {
        format!(
            r#"const {{ {name} }} = await import("{DEV_MODULE_NAME}");

            if (typeof {name} !== 'undefined') {{
                const config = typeof {name} === 'function' ? {name}({{}}) : {name};
                {function}(config, jsArgs);
            }}
            "#,
            name = self.name,
            function = self.kind.fn_name(),
        )
    }
}

impl<A: IntoJsonData, R: FromJsonData> JsCustomFunctionSync<A, R> for CustomFunctionSync {
    fn execute<'js>(&self, ctx: &Ctx<'js>, args: Option<A>) -> Result<Option<R>, JsError> {
        set_args(ctx, args)?;

        let code = &self.get_code();

        evaluate_module(ctx, FUNCTIONS_MODULE_NAME, code)?;

        get_result(ctx)
    }
}
