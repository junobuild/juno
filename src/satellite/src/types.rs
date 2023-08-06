pub mod state {
    use crate::db::types::state::DbHeapState;
    use crate::storage::types::state::{StorageHeapState, StorageRuntimeState};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, Clone)]
    pub struct State {
        // Indirect stable state: State that lives on the heap, but is saved into stable memory on upgrades.
        pub heap: HeapState,

        // Unstable state: State that resides only on the heap, that’s lost after an upgrade.
        pub runtime: RuntimeState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub db: DbHeapState,
        pub storage: StorageHeapState,
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
    use shared::types::state::UserId;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListPaginate {
        pub start_after: Option<Key>,
        pub limit: Option<usize>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub enum ListOrderField {
        #[default]
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
    pub struct ListMatcher {
        pub key: Option<Key>,
        pub description: Option<String>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListParams {
        pub matcher: Option<ListMatcher>,
        pub paginate: Option<ListPaginate>,
        pub order: Option<ListOrder>,
        pub owner: Option<UserId>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListResults<T> {
        pub items: Vec<(Key, T)>,
        pub items_length: usize,
        pub items_page: Option<usize>,
        pub matches_length: usize,
        pub matches_pages: Option<usize>,
    }
}
