pub mod primitives {
    pub struct JsUsize(pub usize);
}

pub mod shared {
    use crate::js::types::candid::JsRawPrincipal;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::state::{Timestamp, Version};

    pub type JsCollectionKey = CollectionKey;

    pub type JsTimestamp = Timestamp;
    pub type JsVersion = Version;

    pub type JsUserId<'js> = JsRawPrincipal<'js>;

    #[derive(Clone)]
    pub enum JsControllerScope {
        Write,
        Admin,
    }

    #[derive(Clone)]
    pub struct JsMetadata(pub String, pub String);

    #[derive(Clone)]
    pub struct JsController {
        pub metadata: Vec<JsMetadata>,
        pub created_at: JsTimestamp,
        pub updated_at: JsTimestamp,
        pub expires_at: Option<JsTimestamp>,
        pub scope: JsControllerScope,
    }

    // TODO: rename similar patterns
    #[derive(Clone)]
    pub struct JsControllerRecord<'js>(pub JsRawPrincipal<'js>, pub JsController);

    #[derive(Clone)]
    pub struct JsControllers<'js>(pub Vec<JsControllerRecord<'js>>);
}

pub mod hooks {
    use crate::hooks::js::types::db::JsDoc;
    use crate::hooks::js::types::interface::{JsCommitBatch, JsDelDoc, JsSetDoc};
    use crate::hooks::js::types::shared::{JsCollectionKey, JsUserId};
    use crate::hooks::js::types::storage::{JsAsset, JsBatch};
    use crate::js::types::candid::JsUint8Array;
    use junobuild_shared::types::core::Key;

    pub type JsKey = Key;

    pub type JsRawData<'js> = JsUint8Array<'js>;

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
    pub struct JsAssetAssertUpload<'js> {
        pub current: Option<JsAsset<'js>>,
        pub batch: JsBatch<'js>,
        pub commit_batch: JsCommitBatch,
    }
}

pub mod db {
    use crate::hooks::js::types::hooks::JsRawData;
    use crate::hooks::js::types::shared::{JsTimestamp, JsUserId, JsVersion};

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
    use crate::hooks::js::types::shared::{JsTimestamp, JsUserId, JsVersion};
    use crate::js::types::candid::JsUint8Array;

    pub type JsBlob<'js> = JsUint8Array<'js>;

    pub type JsBlobOrKey<'js> = JsBlob<'js>;

    pub type JsHash<'js> = JsUint8Array<'js>;

    #[derive(Clone)]
    pub struct JsHeaderField(pub String, pub String);

    #[derive(Clone)]
    pub struct JsAssetEncoding<'js> {
        pub modified: JsTimestamp,
        pub content_chunks: Vec<JsBlobOrKey<'js>>,
        pub total_length: String,
        pub sha256: JsHash<'js>,
    }

    #[derive(Clone)]
    pub struct JsAssetEncodings<'js>(pub String, pub JsAssetEncoding<'js>);

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
        pub headers: Vec<JsHeaderField>,
        pub encodings: Vec<JsAssetEncodings<'js>>,
        pub created_at: JsTimestamp,
        pub updated_at: JsTimestamp,
        pub version: Option<JsVersion>,
    }

    pub type JsReferenceId = String;

    #[derive(Clone)]
    pub struct JsBatch<'js> {
        pub key: JsAssetKey<'js>,
        pub reference_id: Option<JsReferenceId>,
        pub expires_at: JsTimestamp,
        pub encoding_type: Option<String>,
    }
}

pub mod interface {
    use crate::hooks::js::types::hooks::JsRawData;
    use crate::hooks::js::types::shared::JsVersion;
    use crate::hooks::js::types::storage::JsHeaderField;
    use junobuild_shared::types::state::Version;

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

    pub type JsBatchId = String;
    pub type JsChunkId = String;

    #[derive(Clone)]
    pub struct JsCommitBatch {
        pub batch_id: JsBatchId,
        pub headers: Vec<JsHeaderField>,
        pub chunk_ids: Vec<JsChunkId>,
    }
}

pub mod list {
    use crate::hooks::js::types::hooks::JsKey;
    use crate::hooks::js::types::shared::{JsTimestamp, JsUserId};
    use rquickjs::BigInt;

    #[derive(Clone)]
    pub struct JsListPaginate<'js> {
        pub start_after: Option<JsKey>,
        pub limit: Option<BigInt<'js>>,
    }

    #[derive(Clone)]
    pub enum JsListOrderField {
        Keys,
        CreatedAt,
        UpdatedAt,
    }

    #[derive(Clone)]
    pub struct JsListOrder {
        pub desc: bool,
        pub field: JsListOrderField,
    }

    #[derive(Clone)]
    pub enum JsTimestampMatcher {
        Equal(JsTimestamp),
        GreaterThan(JsTimestamp),
        LessThan(JsTimestamp),
        Between(JsTimestamp, JsTimestamp),
    }

    #[derive(Clone)]
    pub struct JsListMatcher {
        pub key: Option<JsKey>,
        pub description: Option<String>,
        pub created_at: Option<JsTimestampMatcher>,
        pub updated_at: Option<JsTimestampMatcher>,
    }

    #[derive(Clone)]
    pub struct JsListParams<'js> {
        pub matcher: Option<JsListMatcher>,
        pub paginate: Option<JsListPaginate<'js>>,
        pub order: Option<JsListOrder>,
        pub owner: Option<JsUserId<'js>>,
    }

    #[derive(Clone)]
    pub struct JsListResults<'js, T> {
        pub items: Vec<(JsKey, T)>,
        pub items_length: BigInt<'js>,
        pub items_page: Option<BigInt<'js>>,
        pub matches_length: BigInt<'js>,
        pub matches_pages: Option<BigInt<'js>>,
    }
}
