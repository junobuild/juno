pub mod state {
    use crate::db::types::state::{CollectionsStable, DbHeapState, DbStable};
    use crate::memory::init_stable_state;
    use crate::storage::types::state::{
        AssetsStable, ContentChunksStable, StorageHeapState, StorageRuntimeState,
    };
    use candid::CandidType;
    use junobuild_shared::types::state::Controllers;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        // Indirect stable state: State that lives on the heap, but is saved into stable memory on upgrades.
        pub heap: HeapState,

        // Unstable state: State that resides only on the heap, that’s lost after an upgrade.
        #[serde(skip, default)]
        pub runtime: RuntimeState,
    }

    pub struct StableState {
        #[deprecated(note = "db is kept for backwards compatibility but, collections should be used.")]
        pub db: DbStable,
        pub collections: Option<CollectionsStable>,

        pub assets: AssetsStable,
        pub content_chunks: ContentChunksStable,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
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

    /// Represents a unique identifier or key.
    ///
    /// This type, `Key`, is an alias for `String`, used to represent unique identifiers or keys within the context
    /// of various data structures and operations.
    ///
    /// `Key` is commonly employed as a unique identifier or key in Rust code.
    pub type Key = String;

    /// Represents the key or identifier of a collection.
    ///
    /// This type, `CollectionKey`, is an alias for `String`, used to represent the key or identifier of a collection
    /// within the context of various data structures and operations.
    ///
    /// `CollectionKey` is commonly employed as a unique identifier for collections in Rust code.
    pub type CollectionKey = String;

    /// Represents binary data as a vector of bytes.
    ///
    /// This type, `Blob`, is an alias for `Vec<u8>`, providing a convenient way to represent binary data
    /// as a collection of bytes.
    pub type Blob = Vec<u8>;

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
    use junobuild_shared::types::state::UserId;
    use serde::Deserialize;

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

pub mod memory {
    use ic_stable_structures::memory_manager::VirtualMemory;
    use ic_stable_structures::DefaultMemoryImpl;

    pub type Memory = VirtualMemory<DefaultMemoryImpl>;
}

pub mod hooks {
    use crate::db::types::state::{DocContext, DocUpsert};
    use crate::storage::types::store::Asset;
    use crate::Doc;
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::UserId;

    /// A generic context struct used in Juno satellite hooks.
    ///
    /// The `HookContext` struct contains information about the caller and associated data.
    ///
    /// # Fields
    /// - `caller`: A `UserId` representing the caller of the hook.
    /// - `data`: A generic type `T` representing the associated data for the hook.
    ///
    /// This context struct is used in various satellite hooks to provide information about the caller
    /// and the specific data related to the hook.
    ///
    /// Example usage:
    /// ```rust
    /// #[on_set_doc(collections = ["demo"])]
    /// async fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
    ///     // Your hook logic here
    /// }
    /// ```
    #[derive(CandidType, Deserialize, Clone)]
    pub struct HookContext<T> {
        pub caller: UserId,
        pub data: T,
    }

    /// A type alias for the context used in the `on_set_doc` satellite hook.
    pub type OnSetDocContext = HookContext<DocContext<DocUpsert>>;

    /// A type alias for the context used in the `on_set_many_docs` satellite hook.
    pub type OnSetManyDocsContext = HookContext<Vec<DocContext<DocUpsert>>>;

    /// A type alias for the context used in the `on_delete_doc` satellite hook.
    pub type OnDeleteDocContext = HookContext<DocContext<Option<Doc>>>;

    /// A type alias for the context used in the `on_delete_many_docs` satellite hook.
    pub type OnDeleteManyDocsContext = HookContext<Vec<DocContext<Option<Doc>>>>;

    /// A type alias for the context used in the `on_upload_asset` satellite hook.
    pub type OnUploadAssetContext = HookContext<Asset>;

    /// A type alias for the context used in the `on_delete_asset` satellite hook.
    pub type OnDeleteAssetContext = HookContext<Option<Asset>>;

    /// A type alias for the context used in the `on_delete_many_assets` satellite hook.
    pub type OnDeleteManyAssetsContext = HookContext<Vec<Option<Asset>>>;
}
