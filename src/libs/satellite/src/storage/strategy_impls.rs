use crate::hooks::invoke_assert_upload_asset;
use crate::storage::state::{
    delete_asset, get_asset, get_config, get_domains, get_rule, insert_asset, insert_asset_encoding,
};
use crate::storage::store::{get_content_chunks_store, get_public_asset_store};
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, Batch, EncodingType, ReferenceId,
};

pub struct StorageAssertions;

impl StorageAssertionsStrategy for StorageAssertions {
    fn invoke_assert_upload_asset(
        &self,
        caller: &Principal,
        asset: &AssetAssertUpload,
    ) -> Result<(), String> {
        invoke_assert_upload_asset(caller, asset)
    }
}

pub struct StorageState;

impl StorageStateStrategy for StorageState {
    fn get_content_chunks(
        &self,
        encoding: &AssetEncoding,
        chunk_index: usize,
        memory: &Memory,
    ) -> Option<Blob> {
        get_content_chunks_store(encoding, chunk_index, memory)
    }

    fn get_public_asset(
        &self,
        full_path: FullPath,
        token: Option<String>,
    ) -> Option<(Asset, Memory)> {
        get_public_asset_store(full_path, token)
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
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Option<Asset> {
        get_asset(collection, full_path, rule)
    }

    fn insert_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        rule: &Rule,
    ) {
        insert_asset(collection, full_path, asset, rule)
    }

    fn delete_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Option<Asset> {
        delete_asset(collection, full_path, rule)
    }
}

pub struct StorageUpload;

impl StorageUploadStrategy for StorageUpload {
    fn insert_asset_encoding(
        &self,
        full_path: &FullPath,
        encoding_type: &EncodingType,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        rule: &Rule,
    ) {
        insert_asset_encoding(full_path, encoding_type, encoding, asset, rule);
    }

    fn insert_asset(&self, batch: &Batch, asset: &Asset, rule: &Rule) -> Result<(), String> {
        insert_asset(&batch.key.collection, &batch.key.full_path, asset, rule);
        Ok(())
    }

    fn get_asset(
        &self,
        _reference_id: &Option<ReferenceId>,
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Result<Option<Asset>, String> {
        let asset = get_asset(collection, full_path, rule);
        Ok(asset)
    }
}
