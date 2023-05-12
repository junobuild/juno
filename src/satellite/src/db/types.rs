pub mod state {
    use crate::rules::types::rules::Rules;
    use crate::types::core::{CollectionKey, Key};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::UserId;
    use std::collections::{BTreeMap, HashMap};

    pub type Collection = BTreeMap<Key, Doc>;
    pub type Db = HashMap<CollectionKey, Collection>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DbStableState {
        pub db: Db,
        pub rules: Rules,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Doc {
        pub owner: UserId,
        pub data: Vec<u8>,
        pub created_at: u64,
        pub updated_at: u64,
        pub description: Option<String>,
    }
}

pub mod interface {
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct SetDoc {
        pub updated_at: Option<u64>,
        pub data: Vec<u8>,
        pub description: Option<String>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelDoc {
        pub updated_at: Option<u64>,
    }
}
