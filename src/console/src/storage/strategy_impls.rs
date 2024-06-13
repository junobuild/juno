use crate::storage::store::heap::{
    delete_asset, get_asset, get_config, get_domains, get_public_asset, get_rule, insert_asset,
};
use crate::storage::store::stable::{
    get_batch_asset, insert_batch_asset, insert_batch_asset_encoding,
};
use crate::storage::store::utils::get_content_chunks;
use candid::Principal;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::CustomDomains;
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

    fn get_domains(&self) -> CustomDomains {
        get_domains()
    }

    fn get_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        get_asset(full_path)
    }

    fn insert_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        _rule: &Rule,
    ) {
        insert_asset(full_path, asset)
    }

    fn delete_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        delete_asset(full_path)
    }
}

pub struct StorageUpload;

impl StorageUploadStrategy for StorageUpload {
    fn insert_asset_encoding(
        &self,
        full_path: &FullPath,
        encoding_type: &str,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        _rule: &Rule,
    ) {
        insert_batch_asset_encoding(full_path, encoding_type, encoding, asset);
    }

    fn insert_asset(
        &self,
        batch_id: &BatchId,
        collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        _rule: &Rule,
    ) {
        insert_batch_asset(batch_id, collection, full_path, asset);
    }

    fn get_asset(
        &self,
        batch_id: &BatchId,
        collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        let asset = get_batch_asset(batch_id, collection, full_path);

        match asset {
            Some(asset) => Some(asset),
            None => get_asset(full_path),
        }
    }
}
