use crate::errors::js::{
    JUNO_SPUTNIK_ERROR_MODULE_DECLARE, JUNO_SPUTNIK_ERROR_MODULE_EVALUATE,
    JUNO_SPUTNIK_ERROR_MODULE_EXECUTE, JUNO_SPUTNIK_ERROR_MODULE_EXECUTE_ASYNC_PROMISE,
};
use crate::js::inner_utils::throw_js_exception;
use rquickjs::{CatchResultExt, CaughtError, Ctx, Error as JsError, Module};

pub async fn evaluate_async_module<'js>(
    ctx: &Ctx<'js>,
    name: &str,
    source: &str,
) -> Result<(), JsError> {
    let promise = Module::evaluate(ctx.clone(), name, source)
        // Without catch "Exception generated by QuickJS" stub error
        // Source: https://github.com/DelSkayn/rquickjs/issues/274#issuecomment-1979043338
        .catch(ctx) // Catch any JS exceptions here
        .map_err(|e: CaughtError| {
            throw_js_exception(ctx, JUNO_SPUTNIK_ERROR_MODULE_EVALUATE, &e)
        })?;

    promise
        .into_future::<()>()
        .await
        .catch(ctx)
        .map_err(|e| throw_js_exception(ctx, JUNO_SPUTNIK_ERROR_MODULE_EXECUTE_ASYNC_PROMISE, &e))
}

pub fn evaluate_module<'js>(ctx: &Ctx<'js>, name: &str, source: &str) -> Result<(), JsError> {
    let result =
        Module::evaluate(ctx.clone(), name, source).and_then(|module| module.finish::<()>());

    result
        .catch(ctx)
        .map_err(|e| throw_js_exception(ctx, JUNO_SPUTNIK_ERROR_MODULE_EXECUTE, &e))
}

pub fn declare_module<'js>(
    ctx: &Ctx<'js>,
    name: &str,
    source: &str,
) -> Result<Module<'js>, JsError> {
    Module::declare(ctx.clone(), name, source)
        .catch(ctx)
        .map_err(|e| throw_js_exception(ctx, JUNO_SPUTNIK_ERROR_MODULE_DECLARE, &e))
}
