pub mod state {
    use junobuild_collections::types::core::CollectionKey;

    #[derive(Default)]
    pub struct State {
        pub runtime: RuntimeState,
    }

    #[derive(Default, Clone)]
    pub struct RuntimeState {
        pub hooks: Hooks,
    }

    #[derive(Default, Clone)]
    pub struct Hooks {
        pub on_set_doc_collections: Vec<CollectionKey>,
        pub on_set_many_docs_collections: Vec<CollectionKey>,
        pub on_delete_doc_collections: Vec<CollectionKey>,
        pub on_delete_many_docs_collections: Vec<CollectionKey>,
        pub on_delete_filtered_docs_collections: Vec<CollectionKey>,

        pub on_upload_asset_collections: Vec<CollectionKey>,
        pub on_delete_asset_collections: Vec<CollectionKey>,
        pub on_delete_many_assets_collections: Vec<CollectionKey>,
        pub on_delete_filtered_assets_collections: Vec<CollectionKey>,

        pub assert_set_doc_collections: Vec<CollectionKey>,
        pub assert_delete_doc_collections: Vec<CollectionKey>,

        pub assert_upload_asset_collections: Vec<CollectionKey>,
        pub assert_delete_asset_collections: Vec<CollectionKey>,
    }
}
