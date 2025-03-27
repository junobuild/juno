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
        pub assert_set_doc_collections: Vec<CollectionKey>,
        pub assert_delete_doc_collections: Vec<CollectionKey>,
    }
}
