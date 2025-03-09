pub mod state {
    use crate::auth::types::state::AuthenticationHeapState;
    use crate::db::types::state::{DbHeapState, DbRuntimeState, DbStable};
    use crate::memory::internal::init_stable_state;
    use crate::storage::types::state::{AssetsStable, ContentChunksStable};
    use candid::CandidType;
    use junobuild_shared::types::state::Controllers;
    use junobuild_storage::types::state::StorageHeapState;
    use rand::rngs::StdRng;
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
        pub db: DbStable,
        pub assets: AssetsStable,
        pub content_chunks: ContentChunksStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub db: DbHeapState,
        pub storage: StorageHeapState,
        pub authentication: Option<AuthenticationHeapState>,
    }

    #[derive(Default, Clone)]
    pub struct RuntimeState {
        pub rng: Option<StdRng>, // rng = Random Number Generator
        pub db: DbRuntimeState,
    }

    #[derive(CandidType, Deserialize, Serialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub enum CollectionType {
        Db,
        Storage,
    }
}

pub mod interface {
    use crate::auth::types::config::AuthenticationConfig;
    use crate::db::types::config::DbConfig;
    use candid::CandidType;
    use junobuild_storage::types::config::StorageConfig;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub struct Config {
        pub storage: StorageConfig,
        pub db: Option<DbConfig>,
        pub authentication: Option<AuthenticationConfig>,
    }
}

pub mod store {
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::state::{Controllers, UserId};

    pub struct StoreContext<'a> {
        pub caller: UserId,
        pub controllers: &'a Controllers,
        pub collection: &'a CollectionKey,
    }
}

pub mod hooks {
    use crate::db::types::state::{DocAssertDelete, DocAssertSet, DocContext, DocUpsert};
    use crate::Doc;
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::UserId;
    use junobuild_storage::types::store::{Asset, AssetAssertUpload};

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

    /// A type alias for the context used in the `on_delete_filtered_docs` satellite hook.
    pub type OnDeleteFilteredDocsContext = HookContext<Vec<DocContext<Option<Doc>>>>;

    /// A type alias for the context used in the `on_upload_asset` satellite hook.
    pub type OnUploadAssetContext = HookContext<Asset>;

    /// A type alias for the context used in the `on_delete_asset` satellite hook.
    pub type OnDeleteAssetContext = HookContext<Option<Asset>>;

    /// A type alias for the context used in the `on_delete_many_assets` satellite hook.
    pub type OnDeleteManyAssetsContext = HookContext<Vec<Option<Asset>>>;

    /// A type alias for the context used in the `on_delete_filtered_assets` satellite hook.
    pub type OnDeleteFilteredAssetsContext = HookContext<Vec<Option<Asset>>>;

    /// A type alias for the context used in the `assert_set_doc` satellite hook.
    pub type AssertSetDocContext = HookContext<DocContext<DocAssertSet>>;

    /// A type alias for the context used in the `assert_delete_doc` satellite hook.
    pub type AssertDeleteDocContext = HookContext<DocContext<DocAssertDelete>>;

    /// A type alias for the context used in the `assert_upload_asset` satellite hook.
    pub type AssertUploadAssetContext = HookContext<AssetAssertUpload>;

    /// A type alias for the context used in the `assert_delete_asset` satellite hook.
    pub type AssertDeleteAssetContext = HookContext<Asset>;
}
