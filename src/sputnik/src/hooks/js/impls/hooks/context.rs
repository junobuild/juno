use crate::hooks::js::types::hooks::JsHookContext;
use rquickjs::{Ctx, IntoJs, Object, Result as JsResult, Value};

impl<'js, T> IntoJs<'js> for JsHookContext<'js, T>
where
    T: IntoJs<'js>,
{
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("caller", self.caller)?;
        obj.set("data", self.data.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}
