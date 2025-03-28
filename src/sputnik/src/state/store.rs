use crate::state::memory::{mutate_state, read_state};
use junobuild_collections::types::core::CollectionKey;

pub fn set_on_set_doc_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.on_set_doc_collections = collections.to_owned());
}

pub fn get_on_set_doc_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_set_doc_collections.clone())
}

pub fn set_on_set_many_docs_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.on_set_many_docs_collections = collections.to_owned());
}

pub fn get_on_set_many_docs_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_set_many_docs_collections.clone())
}

pub fn set_on_delete_doc_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.on_delete_doc_collections = collections.to_owned());
}

pub fn get_on_delete_doc_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_delete_doc_collections.clone())
}

pub fn set_on_delete_many_docs_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.on_delete_many_docs_collections = collections.to_owned()
    });
}

pub fn get_on_delete_many_docs_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_delete_many_docs_collections.clone())
}

pub fn set_on_delete_filtered_docs_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.on_delete_filtered_docs_collections = collections.to_owned()
    });
}

pub fn get_on_delete_filtered_docs_collections() -> Vec<CollectionKey> {
    read_state(|state| {
        state
            .runtime
            .hooks
            .on_delete_filtered_docs_collections
            .clone()
    })
}

pub fn set_on_upload_asset_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.on_upload_asset_collections = collections.to_owned());
}

pub fn get_on_upload_asset_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_upload_asset_collections.clone())
}

pub fn set_on_delete_asset_collections(collections: &[CollectionKey]) {
    mutate_state(|state| state.runtime.hooks.on_delete_asset_collections = collections.to_owned());
}

pub fn get_on_delete_asset_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.on_delete_asset_collections.clone())
}

pub fn set_on_delete_many_assets_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.on_delete_many_assets_collections = collections.to_owned()
    });
}

pub fn get_on_delete_many_assets_collections() -> Vec<CollectionKey> {
    read_state(|state| {
        state
            .runtime
            .hooks
            .on_delete_many_assets_collections
            .clone()
    })
}

pub fn set_on_delete_filtered_assets_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.on_delete_filtered_assets_collections = collections.to_owned()
    });
}

pub fn get_on_delete_filtered_assets_collections() -> Vec<CollectionKey> {
    read_state(|state| {
        state
            .runtime
            .hooks
            .on_delete_filtered_assets_collections
            .clone()
    })
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

pub fn set_assert_upload_asset_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.assert_upload_asset_collections = collections.to_owned()
    });
}

pub fn get_assert_upload_asset_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.assert_upload_asset_collections.clone())
}

pub fn set_assert_delete_asset_collections(collections: &[CollectionKey]) {
    mutate_state(|state| {
        state.runtime.hooks.assert_delete_asset_collections = collections.to_owned()
    });
}

pub fn get_assert_delete_asset_collections() -> Vec<CollectionKey> {
    read_state(|state| state.runtime.hooks.assert_delete_asset_collections.clone())
}
