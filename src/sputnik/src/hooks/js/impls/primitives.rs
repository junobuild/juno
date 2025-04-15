use crate::hooks::js::impls::utils::into_bigint_from_usize;
use crate::hooks::js::types::primitives::JsUsize;
use rquickjs::{Ctx, IntoJs, Result as JsResult, Value};

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsUsize {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let bigint = into_bigint_from_usize(ctx, self.0);
        bigint.into_js(ctx)
    }
}
