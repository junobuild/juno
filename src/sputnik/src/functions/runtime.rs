use crate::functions::runner::future::CustomFunctionAsync;
use crate::functions::runner::instant::CustomFunctionSync;
use crate::functions::runner::types::{JsCustomFunctionAsync, JsCustomFunctionSync};
use crate::js::runtime::{execute_async_js, execute_sync_js, RunAsyncJsFn};
use crate::sdk::js::init_sdk;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::{CatchResultExt, Ctx, Error as JsError};
use std::marker::PhantomData;

pub fn execute_sync_function<A: IntoJsonData, R: FromJsonData>(
    custom_function: &str,
    args: A,
) -> Result<R, String> {
    let function = CustomFunctionSync {
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

pub struct AsyncJsFnContext<A: IntoJsonData + Clone, R: FromJsonData> {
    pub name: String,
    pub args: Option<A>,
    _phantom: PhantomData<R>,
}

impl<A: IntoJsonData + Clone, R: FromJsonData> RunAsyncJsFn<Option<R>> for AsyncJsFnContext<A, R> {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<Option<R>, JsError> {
        init_sdk(ctx)?;

        let function = CustomFunctionAsync {
            name: self.name.to_string(),
        };

        function.execute(ctx, self.args.clone()).await
    }
}

pub async fn execute_async_function<
    A: IntoJsonData + Clone + 'static,
    R: FromJsonData + 'static,
>(
    custom_function: &str,
    args: Option<A>,
) -> Result<Option<R>, String> {
    let execute_context = AsyncJsFnContext {
        name: custom_function.to_string(),
        args,
        _phantom: PhantomData,
    };

    execute_async_js(execute_context).await
}
