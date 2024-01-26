pub mod state {
    use crate::rules::types::rules::Rules;
    use crate::types::core::{Blob, CollectionKey, Key};
    use crate::types::memory::Memory;
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use serde::{Deserialize, Serialize};
    use shared::types::state::UserId;
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

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Doc {
        pub owner: UserId,
        pub data: Blob,
        pub created_at: u64,
        pub updated_at: u64,
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
}

pub mod interface {
    use crate::types::core::Blob;
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct SetDoc {
        pub updated_at: Option<u64>,
        pub data: Blob,
        pub description: Option<String>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelDoc {
        pub updated_at: Option<u64>,
    }
}
