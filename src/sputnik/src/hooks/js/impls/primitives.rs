use crate::hooks::js::impls::utils::{from_bigint_js_to_usize, into_bigint_from_usize};
use crate::hooks::js::types::primitives::JsUsize;
use rquickjs::{BigInt, Ctx, FromJs, IntoJs, Result as JsResult, Value};

impl JsUsize {
    pub fn to_usize(&self) -> usize {
        self.0
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsUsize {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let bigint = into_bigint_from_usize(ctx, self.0);
        bigint.into_js(ctx)
    }
}

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsUsize {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let bigint = BigInt::from_js(ctx, value)?;
        let usize_val = from_bigint_js_to_usize(bigint)?;
        Ok(JsUsize(usize_val))
    }
}
