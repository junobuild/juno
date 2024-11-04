pub mod state {
    use crate::db::types::config::DbConfig;
    use crate::{DelDoc, SetDoc};
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_collections::types::rules::Rules;
    use junobuild_shared::rate::types::RateTokens;
    use junobuild_shared::types::core::{Blob, Key};
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Timestamp, UserId, Version};
    use serde::{Deserialize, Serialize};
    use std::collections::{BTreeMap, HashMap};

    pub type Collection = BTreeMap<Key, Doc>;
    pub type DbHeap = HashMap<CollectionKey, Collection>;

    pub type DbStable = StableBTreeMap<StableKey, Doc, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableKey {
        pub collection: CollectionKey,
        pub key: Key,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DbHeapState {
        pub db: DbHeap,
        pub rules: Rules,
        pub config: Option<DbConfig>,
        pub rate_tokens: Option<HashMap<CollectionKey, RateTokens>>,
    }

    /// Represents a document in a collection's store.
    ///
    /// This struct defines the structure of a document stored in a collection. It includes the following fields:
    /// - `owner`: The `UserId` representing the owner of the document.
    /// - `data`: A `Blob` containing the document's data.
    /// - `description`: An optional `String` providing additional document description, limited to 1024 characters.
    /// - `created_at`: A `u64` timestamp for the document's creation.
    /// - `updated_at`: A `u64` timestamp for the document's last update.
    /// - `version`: A `u64` number for the document's version. The field is optional for backwards compatibility but, will be populated to 1 on the first create or update.
    ///
    /// This struct is used to store and manage documents within a collection's store.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Doc {
        pub owner: UserId,
        pub data: Blob,
        pub description: Option<String>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DocContext<T> {
        pub collection: CollectionKey,
        pub key: Key,
        pub data: T,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DocUpsert {
        pub before: Option<Doc>,
        pub after: Doc,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DocAssertSet {
        pub current: Option<Doc>,
        pub proposed: SetDoc,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DocAssertDelete {
        pub current: Option<Doc>,
        pub proposed: DelDoc,
    }
}

pub mod config {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::config::ConfigMaxMemorySize;
    use serde::Serialize;

    pub type DbConfigMaxMemorySize = ConfigMaxMemorySize;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct DbConfig {
        pub max_memory_size: Option<DbConfigMaxMemorySize>,
    }
}

pub mod interface {
    use candid::CandidType;
    use junobuild_shared::types::core::Blob;
    use junobuild_shared::types::state::Version;
    use serde::{Deserialize, Serialize};

    /// Parameters for setting a document.
    ///
    /// This struct, `SetDoc`, is used to specify the parameters for setting or updating a document in a collection's store.
    /// It includes the following fields:
    /// - `data`: A `Blob` containing the new data for the document.
    /// - `description`: An optional `String` providing additional description for the document. This field is optional.
    /// - `version`: An optional `u64` version representing the last version of the document to ensure
    ///   update consistency. This field is optional - i.e. first time a document is saved, it can be left empty but following updates require the current version to be passed.
    ///
    /// `SetDoc` is used to provide parameters for setting or updating a document in the collection's store.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetDoc {
        pub data: Blob,
        pub description: Option<String>,
        pub version: Option<Version>,
    }

    /// Parameters for deleting a document.
    ///
    /// This struct, `DelDoc`, is used to specify the parameters for deleting a document from a collection's store.
    /// It includes the following field:
    /// - `version`: An optional `u64` version representing the last version of the document to ensure
    ///   deletion consistency. This field is optional.
    ///
    /// `DelDoc` is used to provide deletion parameters when removing a document.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct DelDoc {
        pub version: Option<Version>,
    }
}
