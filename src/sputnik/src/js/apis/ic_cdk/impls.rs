use crate::js::apis::ic_cdk::types::candid::JsRawPrincipal;
use crate::js::types::candid::{JsHttpRequestResult, JsUint8Array};
use candid::{Nat, Principal};
use rquickjs::{Ctx, Error as JsError, FromJs, IntoJs, Result as JsResult, TypedArray, Value, Object, Array};
use ic_cdk::management_canister::{http_request_with_closure, HttpMethod, HttpRequestArgs, HttpRequestResult, HttpHeader};

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

    pub fn from_principal(ctx: &Ctx<'js>, principal: &Principal) -> JsResult<Self> {
        JsRawPrincipal::from_bytes(ctx, principal.as_slice())
    }
}

impl<'js> JsHttpRequestResult<'js> {
    pub fn from_result(ctx: &Ctx<'js>, result: HttpRequestResult) -> JsResult<Self> {
        let obj = Object::new(ctx.clone())?;

        let status: u64 = result.status.0.try_into().unwrap_or(0);
        obj.set("status", status)?;

        let headers_arr = Array::new(ctx.clone())?;
        for (i, h) in result.headers.into_iter().enumerate() {
            let header_obj = Object::new(ctx.clone())?;
            header_obj.set("name", h.name)?;
            header_obj.set("value", h.value)?;
            headers_arr.set(i, header_obj)?;
        }
        obj.set("headers", headers_arr)?;

        let body = JsUint8Array::from_bytes(ctx, &result.body)?;
        obj.set("body", body)?;

        Ok(Self(obj))
    }

    pub fn to_result(&self) -> JsResult<HttpRequestResult> {
        let status: u64 = self.0.get("status")?;

        let headers: Vec<HttpHeader> = self
            .0
            .get::<_, Array>("headers")?
            .iter::<Object>()
            .map(|h| {
                let h = h?;
                Ok(HttpHeader {
                    name: h.get("name")?,
                    value: h.get("value")?,
                })
            })
            .collect::<JsResult<_>>()?;

        let body = self.0.get::<_, JsUint8Array>("body")?;

        Ok(HttpRequestResult {
            status: Nat::from(status),
            headers,
            body: body.to_bytes()?.to_vec(),
        })
    }
}

impl<'js> IntoJs<'js> for JsHttpRequestResult<'js> {
    fn into_js(self, _ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        Ok(self.0.into_value())
    }
}

impl<'js> FromJs<'js> for JsHttpRequestResult<'js> {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        Ok(Self(Object::from_value(value)?))
    }
}