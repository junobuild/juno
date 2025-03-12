use crate::errors::js::{
    JUNO_SPUTNIK_ERROR_RUNTIME_API_INIT, JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_CONTEXT,
    JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_EXECUTE, JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_RUNTIME,
    JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_CONTEXT, JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_RUNTIME,
};
use crate::js::apis::init_apis;
use crate::js::dev::script::declare_dev_script;
use crate::js::types::RunAsyncJsFn;
use rquickjs::{async_with, AsyncContext, AsyncRuntime, Context, Ctx, Runtime};

pub async fn execute_async_js<T>(f: T) -> Result<(), String>
where
    T: RunAsyncJsFn,
{
    let rt = AsyncRuntime::new()
        .map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_RUNTIME, e))?;
    let ctx = AsyncContext::full(&rt)
        .await
        .map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_CONTEXT, e))?;

    async_with!(ctx => |ctx|{
        init_apis(&ctx).map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_API_INIT, e))?;

        declare_dev_script(&ctx)?;

        f.run(&ctx).await.map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_ASYNC_EXECUTE, e))?;

        Ok::<(), String>(())
    })
    .await?;

    rt.idle().await;

    Ok(())
}

pub fn execute_sync_js<F>(f: F) -> Result<(), String>
where
    F: FnOnce(&Ctx) -> Result<(), String>,
{
    let rt = Runtime::new()
        .map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_RUNTIME, e))?;
    let ctx = Context::full(&rt)
        .map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_SYNC_CONTEXT, e))?;

    ctx.with(|ctx| -> Result<(), String> {
        init_apis(&ctx).map_err(|e| format!("{} ({})", JUNO_SPUTNIK_ERROR_RUNTIME_API_INIT, e))?;

        declare_dev_script(&ctx)?;

        f(&ctx)
    })
}
