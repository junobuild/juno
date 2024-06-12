use crate::storage::state::{
    get_config, get_content_chunks, get_rule, insert_asset, insert_asset_encoding,
};
use crate::storage::store::get_public_asset;
use candid::Principal;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageStateStrategy, StorageStoreStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{BatchId, FullPath};
use junobuild_storage::types::store::{Asset, AssetAssertUpload, AssetEncoding};

pub struct StorageAssertions;

impl StorageAssertionsStrategy for StorageAssertions {
    fn invoke_assert_upload_asset(
        &self,
        _caller: &Principal,
        _asset: &AssetAssertUpload,
    ) -> Result<(), String> {
        // No pre-assertions on the console
        Ok(())
    }
}

pub struct StorageState;

impl StorageStateStrategy for StorageState {
    fn get_content_chunks(
        &self,
        encoding: &AssetEncoding,
        chunk_index: usize,
        _memory: &Memory,
    ) -> Option<Blob> {
        get_content_chunks(encoding, chunk_index)
    }

    fn get_public_asset(
        &self,
        full_path: FullPath,
        token: Option<String>,
    ) -> Option<(Asset, Memory)> {
        get_public_asset(full_path, token)
    }

    fn get_rule(&self, collection: &CollectionKey) -> Result<Rule, String> {
        get_rule(collection)
    }

    fn get_config(&self) -> StorageConfig {
        get_config()
    }
}

pub struct StorageStore;

impl StorageStoreStrategy for StorageStore {
    fn get_asset(
        &self,
        _collection: &CollectionKey,
        _full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        // Function unused in case of the console
        None
    }

    fn insert_asset_encoding(
        &self,
        full_path: &FullPath,
        encoding_type: &str,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        _rule: &Rule,
    ) {
        insert_asset_encoding(full_path, encoding_type, encoding, asset);
    }

    fn insert_asset(
        &self,
        batch_id: &BatchId,
        collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        _rule: &Rule,
    ) {
        insert_asset(batch_id, collection, full_path, asset);
    }
}
