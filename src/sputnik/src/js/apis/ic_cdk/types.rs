pub mod candid {
    use rquickjs::{Object, TypedArray};

    #[derive(Clone)]
    pub struct JsUint8Array<'js>(pub TypedArray<'js, u8>);

    pub type JsRawPrincipal<'js> = JsUint8Array<'js>;

    pub type JsCallRawArgs<'js> = JsUint8Array<'js>;
    pub type JsCallRawResult<'js> = JsUint8Array<'js>;
}

pub mod http_request {
    use crate::js::types::candid::JsUint8Array;

    #[derive(Clone)]
    pub struct JsHttpHeader {
        pub name: String,
        pub value: String,
    }

    #[derive(Clone)]
    pub enum JsHttpMethod {
        Get,
        Post,
        Head,
    }

    #[derive(Clone)]
    pub struct JsHttpRequestArgs<'js> {
        pub url: String,
        pub max_response_bytes: Option<u64>,
        pub method: JsHttpMethod,
        pub headers: Vec<JsHttpHeader>,
        pub body: Option<JsUint8Array<'js>>,
        pub transform: Option<String>,
        pub is_replicated: Option<bool>,
    }

    #[derive(Clone)]
    pub struct JsHttpRequestResult<'js> {
        pub status: u64,
        pub headers: Vec<JsHttpHeader>,
        pub body: JsUint8Array<'js>,
    }
}
