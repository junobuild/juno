pub mod state {
    use crate::rules::types::rules::Rules;
    use crate::types::core::{Blob, CollectionKey, Key};
    use crate::types::memory::Memory;
    use crate::{DelDoc, SetDoc};
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::state::{Timestamp, UserId};
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

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct DbHeapState {
        pub db: DbHeap,
        pub rules: Rules,
    }

    /// Represents a document in a collection's store.
    ///
    /// This struct defines the structure of a document stored in a collection. It includes the following fields:
    /// - `owner`: The `UserId` representing the owner of the document.
    /// - `data`: A `Blob` containing the document's data.
    /// - `created_at`: A `u64` timestamp for the document's creation.
    /// - `updated_at`: A `u64` timestamp for the document's last update.
    /// - `description`: An optional `String` providing additional document description, limited to 1024 characters.
    ///
    /// This struct is used to store and manage documents within a collection's store.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Doc {
        pub owner: UserId,
        pub data: Blob,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub description: Option<String>,
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

pub mod interface {
    use crate::types::core::Blob;
    use candid::CandidType;
    use junobuild_shared::types::state::Timestamp;
    use serde::{Deserialize, Serialize};

    /// Parameters for setting a document.
    ///
    /// This struct, `SetDoc`, is used to specify the parameters for setting or updating a document in a collection's store.
    /// It includes the following fields:
    /// - `updated_at`: An optional `u64` timestamp representing the last update time of the document to ensure
    ///   update consistency. This field is optional.
    /// - `data`: A `Blob` containing the new data for the document.
    /// - `description`: An optional `String` providing additional description for the document. This field is optional.
    ///
    /// `SetDoc` is used to provide parameters for setting or updating a document in the collection's store.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetDoc {
        pub updated_at: Option<Timestamp>,
        pub data: Blob,
        pub description: Option<String>,
    }

    /// Parameters for deleting a document.
    ///
    /// This struct, `DelDoc`, is used to specify the parameters for deleting a document from a collection's store.
    /// It includes the following field:
    /// - `updated_at`: An optional `u64` timestamp representing the last update time of the document to ensure
    ///   deletion consistency. This field is optional.
    ///
    /// `DelDoc` is used to provide deletion parameters when removing a document.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct DelDoc {
        pub updated_at: Option<Timestamp>,
    }
}
