use crate::state::memory::{mutate_state, read_state};
use junobuild_collections::types::core::CollectionKey;

pub fn set_on_set_docs_collections(collections: Vec<CollectionKey>) {
    mutate_state(|state| state.runtime.hooks.on_set_docs_collections = collections.clone());
}

pub fn get_on_set_docs_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_set_docs_collections.clone())
}

pub fn set_assert_set_docs_collections(collections: Vec<CollectionKey>) {
    mutate_state(|state| state.runtime.hooks.assert_set_docs_collections = collections.clone());
}

pub fn get_assert_set_docs_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.assert_set_docs_collections.clone())
}
