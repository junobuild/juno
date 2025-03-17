pub mod candid {
    use rquickjs::TypedArray;

    #[derive(Clone)]
    pub struct JsUint8Array<'js>(pub TypedArray<'js, u8>);

    pub type JsRawPrincipal<'js> = JsUint8Array<'js>;
    pub type JsCallArgs<'js> = JsUint8Array<'js>;
    pub type JsCallResult<'js> = JsUint8Array<'js>;
}
