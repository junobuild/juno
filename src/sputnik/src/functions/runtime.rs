use crate::functions::runner::sync::CustomFunction;
use crate::functions::runner::types::JsCustomFunctionSync;
use crate::sdk::js::init_sdk;
use crate::js::runtime::execute_sync_js;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::CatchResultExt;

pub fn execute_sync_function<A: IntoJsonData, R: FromJsonData>(
    custom_function: &str,
    args: A,
) -> Result<R, String> {
    let function = CustomFunction {
        name: custom_function.to_string(),
    };

    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        function
            .execute(ctx, args)
            .catch(ctx)
            .map_err(|e| e.to_string())
    })
}
