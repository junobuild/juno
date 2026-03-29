use crate::js::apis::ic_cdk::types::candid::JsRawPrincipal;
use crate::js::apis::types::http_request::{
    JsHttpHeader, JsHttpMethod, JsHttpRequestArgs, JsHttpRequestResult,
};
use crate::js::types::candid::JsUint8Array;
use candid::Principal;
use ic_cdk::management_canister::{
    HttpHeader, HttpMethod, HttpRequestArgs, HttpRequestResult, TransformContext, TransformFunc,
};
use junobuild_shared::ic::api::id;
use rquickjs::{
    Array, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, TypedArray, Value,
};

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

/// JsHttpHeader <> HttpHeader

impl JsHttpHeader {
    pub fn from_header(header: &HttpHeader) -> Self {
        Self {
            name: header.name.clone(),
            value: header.value.clone(),
        }
    }

    pub fn to_header(self) -> HttpHeader {
        HttpHeader {
            name: self.name,
            value: self.value,
        }
    }
}

impl<'js> IntoJs<'js> for JsHttpHeader {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("name", self.name)?;
        obj.set("value", self.value)?;
        Ok(obj.into_value())
    }
}

impl<'js> FromJs<'js> for JsHttpHeader {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;
        Ok(Self {
            name: obj.get("name")?,
            value: obj.get("value")?,
        })
    }
}

/// JsHttpMethod <> HttpMethod

impl JsHttpMethod {
    pub fn to_method(self) -> HttpMethod {
        match self {
            Self::Get => HttpMethod::GET,
            Self::Post => HttpMethod::POST,
            Self::Head => HttpMethod::HEAD,
        }
    }
}

impl<'js> FromJs<'js> for JsHttpMethod {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let s = String::from_js(_ctx, value)?;
        match s.to_uppercase().as_str() {
            "GET" => Ok(Self::Get),
            "POST" => Ok(Self::Post),
            "HEAD" => Ok(Self::Head),
            _ => Err(JsError::new_from_js("string", "JsHttpMethod")),
        }
    }
}

/// JsHttpRequestResult <> HttpRequestResult

impl<'js> JsHttpRequestResult<'js> {
    pub fn from_result(ctx: &Ctx<'js>, result: &HttpRequestResult) -> JsResult<Self> {
        Ok(Self {
            status: u64::try_from(&result.status.0).unwrap_or(0),
            headers: result
                .headers
                .iter()
                .map(JsHttpHeader::from_header)
                .collect(),
            body: JsUint8Array::from_bytes(ctx, &result.body)?,
        })
    }
}

impl<'js> IntoJs<'js> for JsHttpRequestResult<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("status", self.status)?;

        let headers_arr = Array::new(ctx.clone())?;
        for (i, h) in self.headers.into_iter().enumerate() {
            headers_arr.set(i, h)?;
        }
        obj.set("headers", headers_arr)?;

        obj.set("body", self.body)?;

        Ok(obj.into_value())
    }
}

/// JsHttpRequestArgs <> HttpRequestArgs

impl<'js> JsHttpRequestArgs<'js> {
    pub fn to_args(self) -> JsResult<HttpRequestArgs> {
        let transform = self.transform.map(|method| TransformContext {
            function: TransformFunc(candid::Func {
                principal: id(),
                method,
            }),
            context: vec![],
        });

        Ok(HttpRequestArgs {
            url: self.url,
            max_response_bytes: self.max_response_bytes,
            method: self.method.to_method(),
            headers: self
                .headers
                .into_iter()
                .map(JsHttpHeader::to_header)
                .collect(),
            body: self
                .body
                .map(|b| b.to_bytes().map(|s| s.to_vec()))
                .transpose()?,
            transform,
            is_replicated: self.is_replicated,
        })
    }
}

impl<'js> FromJs<'js> for JsHttpRequestArgs<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let headers: Vec<JsHttpHeader> = {
            let arr: Array = obj.get("headers")?;
            arr.iter()
                .map(|v| JsHttpHeader::from_js(ctx, v?))
                .collect::<JsResult<Vec<JsHttpHeader>>>()?
        };

        Ok(Self {
            url: obj.get("url")?,
            max_response_bytes: obj.get("maxResponseBytes")?,
            method: obj.get("method")?,
            headers,
            body: obj.get("body")?,
            transform: obj.get("transform")?,
            is_replicated: obj.get("isReplicated")?,
        })
    }
}
