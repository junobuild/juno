use rquickjs::{BigInt, Ctx, IntoJs, Result as JsResult, Value};

pub struct JsBigInt(pub u64);

impl<'js> IntoJs<'js> for JsBigInt {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let bigint = BigInt::from_u64(ctx.clone(), self.0)?;
        Ok(bigint.into_value())
    }
}
