use crate::storage::state::heap::{
    delete_asset, get_asset, get_config, get_domains, get_rule, insert_asset,
};
use crate::storage::state::stable::{
    get_proposal_asset, insert_proposal_asset, insert_proposal_asset_encoding,
};
use crate::storage::state::utils::get_content_chunks;
use crate::storage::store::get_public_asset;
use candid::Principal;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::CustomDomains;
use junobuild_storage::types::runtime_state::BatchId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetAssertUpload, AssetEncoding, Batch};

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
        insert_proposal_asset_encoding(full_path, encoding_type, encoding, asset);
    }

    fn insert_asset(&self, batch: &Batch, asset: &Asset, _rule: &Rule) -> Result<(), String> {
        match &batch.batch_group_id {
            Some(batch_group_id) => {
                insert_proposal_asset(
                    batch_group_id,
                    &batch.key.collection,
                    &batch.key.full_path,
                    asset,
                );
                Ok(())
            }
            None => Err("Cannot insert asset to unknown batch group id.".to_string()),
        }
    }

    fn get_asset(
        &self,
        batch_id: &BatchId,
        collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        let asset = get_proposal_asset(batch_id, collection, full_path);

        match asset {
            Some(asset) => Some(asset),
            None => get_asset(full_path),
        }
    }
}
