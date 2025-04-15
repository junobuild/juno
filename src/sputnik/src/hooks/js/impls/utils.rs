use rquickjs::{BigInt, Ctx, Error as JsError, IntoJs, Result as JsResult, Value};

pub fn into_bigint_js<'js>(ctx: &Ctx<'js>, value: u64) -> JsResult<BigInt<'js>> {
    BigInt::from_u64(ctx.clone(), value)
}

pub fn into_optional_bigint_js<'js>(ctx: &Ctx<'js>, value: Option<u64>) -> JsResult<Value<'js>> {
    if let Some(value) = value {
        into_bigint_js(ctx, value).into_js(ctx)
    } else {
        Ok(Value::new_undefined(ctx.clone()))
    }
}

pub fn into_bigint_from_usize<'js>(ctx: &Ctx<'js>, value: usize) -> JsResult<BigInt<'js>> {
    let value: u64 = value.try_into().map_err(|_| {
        rquickjs::Error::new_from_js("usize", "Failed to convert usize to u64 for BigInt")
    })?;

    BigInt::from_u64(ctx.clone(), value)
}

pub fn into_optional_bigint_from_usize<'js>(
    ctx: &Ctx<'js>,
    value: Option<usize>,
) -> JsResult<Option<BigInt<'js>>> {
    value.map(|v| into_bigint_from_usize(ctx, v)).transpose()
}

pub fn from_optional_bigint_js(value: Option<BigInt>) -> JsResult<Option<u64>> {
    match value {
        Some(bigint) => Ok(Some(from_bigint_js(bigint)?)),
        None => Ok(None),
    }
}

pub fn from_bigint_js(bigint: BigInt) -> JsResult<u64> {
    let value = bigint.to_i64()?;

    if value >= 0 {
        // to_i64 fails if value is not a number or not convertible to int64_t (too large or too small).
        // We also assert the value is positive.
        // That's why this cast is safe.
        Ok(value as u64)
    } else {
        Err(JsError::new_from_js("BigInt", "u64"))
    }
}

pub fn from_bigint_js_to_usize(bigint: BigInt) -> JsResult<usize> {
    let value = from_bigint_js(bigint)?;

    value
        .try_into()
        .map_err(|_| JsError::new_from_js("BigInt", "usize"))
}
