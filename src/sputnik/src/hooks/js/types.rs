pub mod hooks {
    use crate::hooks::js::types::interface::{JsDelDoc, JsSetDoc};
    use crate::js::types::candid::{JsRawPrincipal, JsUint8Array};
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::core::Key;
    use junobuild_shared::types::state::{Timestamp, Version};

    pub type JsCollectionKey = CollectionKey;
    pub type JsKey = Key;
    pub type JsTimestamp = Timestamp;
    pub type JsVersion = Version;

    pub type JsRawData<'js> = JsUint8Array<'js>;

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
    pub struct JsDocAssertDelete<'js> {
        pub current: Option<JsDoc<'js>>,
        pub proposed: JsDelDoc,
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

pub mod storage {
    use crate::hooks::js::types::hooks::{JsTimestamp, JsUserId, JsVersion};
    use crate::js::types::candid::JsUint8Array;

    pub type JsHeaderField<'js> = (String, String);

    pub type JsBlob<'js> = JsUint8Array<'js>;

    pub type JsBlobOrKey<'js> = JsBlob<'js>;

    pub type JsHash<'js> = JsUint8Array<'js>;

    #[derive(Clone)]
    pub struct JsAssetEncoding<'js> {
        pub modified: JsTimestamp,
        pub content_chunks: Vec<JsBlobOrKey<'js>>,
        pub total_length: u128,
        pub sha256: JsHash<'js>,
    }

    #[derive(Clone)]
    pub struct JsAssetKey<'js> {
        pub name: String,
        pub full_path: String,
        pub token: Option<String>,
        pub collection: String,
        pub owner: JsUserId<'js>,
        pub description: Option<String>,
    }

    #[derive(Clone)]
    pub struct JsAsset<'js> {
        pub key: JsAssetKey<'js>,
        pub headers: Vec<JsHeaderField<'js>>,
        pub encodings: Vec<(String, JsAssetEncoding<'js>)>,
        pub created_at: JsTimestamp,
        pub updated_at: JsTimestamp,
        pub version: Option<JsVersion>,
    }

    pub type JsReferenceId = u128;

    #[derive(Clone)]
    pub struct JsBatch<'js> {
        pub key: JsAssetKey<'js>,
        pub reference_id: Option<JsReferenceId>,
        pub expires_at: JsTimestamp,
        pub encoding_type: Option<String>,
    }
}

pub mod interface {
    use crate::hooks::js::types::hooks::{JsRawData, JsVersion};
    use junobuild_shared::types::state::Version;
    use crate::hooks::js::types::storage::JsHeaderField;

    #[derive(Clone)]
    pub struct JsSetDoc<'js> {
        pub data: JsRawData<'js>,
        pub description: Option<String>,
        pub version: Option<JsVersion>,
    }

    #[derive(Clone)]
    pub struct JsDelDoc {
        pub version: Option<Version>,
    }

    pub type JsBatchId = u128;
    pub type JsChunkId = u128;

    #[derive(Clone)]
    pub struct JsCommitBatch<'js> {
        pub batch_id: JsBatchId,
        pub headers: Vec<JsHeaderField<'js>>,
        pub chunk_ids: Vec<JsChunkId>,
    }
}
