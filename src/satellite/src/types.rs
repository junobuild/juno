pub mod state {
    use crate::db::types::state::DbStableState;
    use crate::storage::types::state::{StorageRuntimeState, StorageStableState};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
        pub runtime: RuntimeState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub controllers: Controllers,
        pub db: DbStableState,
        pub storage: StorageStableState,
    }

    #[derive(Default, Clone)]
    pub struct RuntimeState {
        pub storage: StorageRuntimeState,
    }
}

pub mod core {
    use std::cmp::Ordering;

    pub type Key = String;
    pub type CollectionKey = String;

    pub trait Compare {
        fn cmp_updated_at(&self, other: &Self) -> Ordering;
        fn cmp_created_at(&self, other: &Self) -> Ordering;
    }
}

pub mod interface {
    use crate::storage::types::config::StorageConfig;
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub enum RulesType {
        Db,
        Storage,
    }

    #[derive(CandidType, Deserialize)]
    pub struct Config {
        pub storage: StorageConfig,
    }
}

pub mod list {
    use crate::types::core::Key;
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListPaginate {
        pub start_after: Option<Key>,
        pub limit: Option<usize>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub enum ListOrderField {
        Keys,
        CreatedAt,
        UpdatedAt,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListOrder {
        pub desc: bool,
        pub field: ListOrderField,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListParams {
        pub matcher: Option<String>,
        pub paginate: Option<ListPaginate>,
        pub order: Option<ListOrder>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListResults<T> {
        pub items: Vec<(Key, T)>,
        pub length: usize,
        pub matches_length: usize,
    }
}
