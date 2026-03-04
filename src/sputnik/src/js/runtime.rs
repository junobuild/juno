use crate::errors::js::{
    JUNO_SPUTNIK_ERROR_RUNTIME_API_INIT, JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_CONTEXT,
    JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_RUNTIME, JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_CONTEXT,
    JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_RUNTIME,
};
use crate::js::apis::init_apis;
use crate::js::dev::script::declare_dev_script;
use crate::js::inner_utils::format_js_error;
use rquickjs::{
    async_with, AsyncContext, AsyncRuntime, CatchResultExt, Context, Ctx, Error as JsError, Runtime,
};

pub trait RunAsyncJsFn<T = ()> {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<T, JsError>;
}

pub async fn execute_async_js<F, T: 'static>(f: F) -> Result<T, String>
where
    F: RunAsyncJsFn<T>,
{
    let rt = AsyncRuntime::new()
        .map_err(|e| format_js_error(JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_RUNTIME, e))?;
    let ctx = AsyncContext::full(&rt)
        .await
        .map_err(|e| format_js_error(JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_CONTEXT, e))?;

    let result = async_with!(ctx => |ctx|{
        init_apis(&ctx).map_err(|e| format_js_error(JUNO_SPUTNIK_ERROR_RUNTIME_API_INIT, e))?;

        declare_dev_script(&ctx).map_err(|e| e.to_string())?;

        let result = f.run(&ctx).await.catch(&ctx).map_err(|e| e.to_string())?;

        Ok::<T, String>(result)
    })
    .await?;

    rt.idle().await;

    Ok(result)
}

pub fn execute_sync_js<F, T>(f: F) -> Result<T, String>
where
    F: FnOnce(&Ctx) -> Result<T, String>,
{
    let rt =
        Runtime::new().map_err(|e| format_js_error(JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_RUNTIME, e))?;
    let ctx = Context::full(&rt)
        .map_err(|e| format_js_error(JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_CONTEXT, e))?;

    ctx.with(|ctx| -> Result<T, String> {
        init_apis(&ctx).map_err(|e| format_js_error(JUNO_SPUTNIK_ERROR_RUNTIME_API_INIT, e))?;

        declare_dev_script(&ctx).map_err(|e| e.to_string())?;

        f(&ctx)
    })
}
