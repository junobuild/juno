use crate::state::memory::{mutate_state, read_state};
use junobuild_collections::types::core::CollectionKey;

pub fn set_on_set_doc_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.on_set_doc_collections = collections.to_owned());
}

pub fn get_on_set_doc_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_set_doc_collections.clone())
}

pub fn set_assert_set_doc_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.assert_set_doc_collections = collections.to_owned());
}

pub fn get_assert_set_doc_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.assert_set_doc_collections.clone())
}

pub fn set_assert_delete_doc_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.assert_delete_doc_collections = collections.to_owned()
    });
}

pub fn get_assert_delete_doc_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.assert_delete_doc_collections.clone())
}
