use crate::hooks::js::impls::shared::JsBigInt;
use rquickjs::{BigInt, Ctx, Error as JsError, IntoJs, Result as JsResult, Value};

pub fn into_optional_bigint_js<'js>(ctx: &Ctx<'js>, value: Option<u64>) -> JsResult<Value<'js>> {
    if let Some(value) = value {
        JsBigInt(value).into_js(ctx)
    } else {
        Ok(Value::new_undefined(ctx.clone()))
    }
}

pub fn from_optional_bigint_js(value: Option<BigInt>) -> JsResult<Option<u64>> {
    match value {
        Some(bigint) => {
            let value = bigint.to_i64()?;

            if value >= 0 {
                // to_i64 fails if value is not a number or not convertible to int64_t (too large or too small).
                // We also assert the value is positive.
                // That's why this cast is safe.
                Ok(Some(value as u64))
            } else {
                Err(JsError::new_from_js("BigInt", "u64"))
            }
        }
        None => Ok(None),
    }
}
