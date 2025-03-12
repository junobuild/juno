pub mod hooks {
    use crate::hooks::js::types::interface::JsSetDoc;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::core::Key;
    use junobuild_shared::types::state::{Timestamp, Version};
    use rquickjs::TypedArray;

    pub type JsCollectionKey = CollectionKey;
    pub type JsKey = Key;
    pub type JsTimestamp = Timestamp;
    pub type JsVersion = Version;

    #[derive(Clone)]
    pub struct JsRawPrincipal<'js>(pub TypedArray<'js, u8>);

    #[derive(Clone)]
    pub struct JsRawData<'js>(pub TypedArray<'js, u8>);

    pub type JsUserId<'js> = JsRawPrincipal<'js>;

    #[derive(Clone)]
    pub struct JsHookContext<'js, T> {
        pub caller: JsUserId<'js>,
        pub data: T,
    }

    #[derive(Clone)]
    pub struct JsDocContext<T> {
        pub collection: JsCollectionKey,
        pub key: JsKey,
        pub data: T,
    }

    #[derive(Clone)]
    pub struct JsDocUpsert<'js> {
        pub before: Option<JsDoc<'js>>,
        pub after: JsDoc<'js>,
    }

    #[derive(Clone)]
    pub struct JsDocAssertSet<'js> {
        pub current: Option<JsDoc<'js>>,
        pub proposed: JsSetDoc<'js>,
    }

    #[derive(Clone)]
    pub struct JsDoc<'js> {
        pub owner: JsUserId<'js>,
        pub data: JsRawData<'js>,
        pub description: Option<String>,
        pub created_at: JsTimestamp,
        pub updated_at: JsTimestamp,
        pub version: Option<JsVersion>,
    }
}

pub mod interface {
    use crate::hooks::js::types::hooks::{JsRawData, JsVersion};

    #[derive(Clone)]
    pub struct JsSetDoc<'js> {
        pub data: JsRawData<'js>,
        pub description: Option<String>,
        pub version: Option<JsVersion>,
    }
}
