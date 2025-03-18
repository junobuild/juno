pub mod candid {
    use rquickjs::TypedArray;

    #[derive(Clone)]
    pub struct JsUint8Array<'js>(pub TypedArray<'js, u8>);

    pub type JsRawPrincipal<'js> = JsUint8Array<'js>;

    pub type JsCallRawArgs<'js> = JsUint8Array<'js>;
    pub type JsCallRawResult<'js> = JsUint8Array<'js>;
}
