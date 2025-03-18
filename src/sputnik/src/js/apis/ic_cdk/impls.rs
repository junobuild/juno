use crate::js::apis::ic_cdk::types::candid::JsRawPrincipal;
use crate::js::types::candid::JsUint8Array;
use candid::Principal;
use rquickjs::{Ctx, Error as JsError, FromJs, IntoJs, Result as JsResult, TypedArray, Value};

impl<'js> JsUint8Array<'js> {
    pub fn from_bytes(ctx: &Ctx<'js>, bytes: &[u8]) -> JsResult<Self> {
        let typed_array = TypedArray::new(ctx.clone(), bytes)?;
        Ok(JsUint8Array(typed_array))
    }

    pub fn to_bytes(&self) -> JsResult<&[u8]> {
        self.0
            .as_bytes()
            .ok_or_else(|| JsError::new_from_js("TypedArray", "RawBytes"))
    }
}

impl<'js> IntoJs<'js> for JsUint8Array<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        self.0.into_js(ctx)
    }
}

impl<'js> FromJs<'js> for JsUint8Array<'js> {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let array: TypedArray<'js, u8> = TypedArray::from_value(value)?;
        Ok(JsUint8Array(array))
    }
}

impl<'js> JsRawPrincipal<'js> {
    pub fn to_principal(&self) -> JsResult<Principal> {
        self.to_bytes()
            .map(Principal::from_slice)
            .map_err(|_| JsError::new_from_js("JsRawPrincipal", "Principal"))
    }
}
