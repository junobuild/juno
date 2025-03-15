pub mod candid {
    use rquickjs::TypedArray;

    #[derive(Clone)]
    pub struct JsRawPrincipal<'js>(pub TypedArray<'js, u8>);
}
