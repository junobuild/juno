pub mod state {
    use crate::db::types::state::DbStableState;
    use crate::storage::types::state::{StorageRuntimeState, StorageStableState};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::interface::Controllers;

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
    pub type Key = String;
    pub type CollectionKey = String;
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
    use std::cmp::Ordering;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct PaginateKeys {
        pub start_after: Option<Key>,
        pub limit: Option<usize>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub enum OrderField {
        Keys,
        CreatedAt,
        UpdatedAt,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Order {
        pub desc: bool,
        pub field: OrderField,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListParams {
        pub matcher: Option<String>,
        pub paginate: Option<PaginateKeys>,
        pub order: Option<Order>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListResults<T> {
        pub items: Vec<(Key, T)>,
        pub length: usize,
        pub matches_length: usize,
    }

    pub trait Compare {
        fn cmp_updated_at(&self, other: &Self) -> Ordering;

        fn cmp_created_at(&self, other: &Self) -> Ordering;
    }
}
