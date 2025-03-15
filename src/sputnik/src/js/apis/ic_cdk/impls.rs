use crate::js::apis::ic_cdk::types::candid::JsRawPrincipal;
use candid::Principal;
use rquickjs::{Ctx, Error as JsError, FromJs, IntoJs, Result as JsResult, TypedArray, Value};

impl<'js> IntoJs<'js> for JsRawPrincipal<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        self.0.into_js(ctx)
    }
}

impl<'js> FromJs<'js> for JsRawPrincipal<'js> {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let array: TypedArray<'js, u8> = TypedArray::from_value(value)?;
        Ok(JsRawPrincipal(array))
    }
}

impl<'js> JsRawPrincipal<'js> {
    pub fn from_bytes(ctx: &Ctx<'js>, bytes: &[u8]) -> JsResult<Self> {
        let typed_array = TypedArray::new(ctx.clone(), bytes)?;
        Ok(JsRawPrincipal(typed_array))
    }

    pub fn to_principal(&self) -> JsResult<Principal> {
        self.0
            .as_bytes()
            .map(Principal::from_slice)
            .ok_or_else(|| JsError::new_from_js("JsRawPrincipal", "Principal"))
    }
}
