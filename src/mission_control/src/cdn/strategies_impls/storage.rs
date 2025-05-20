use crate::cdn::helpers::heap::get_storage_config;
use crate::cdn::strategies_impls::cdn::{CdnHeap, CdnStable};
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, Batch, EncodingType, ReferenceId,
};
use junobuild_storage::utils::clone_asset_encoding_content_chunks;

pub struct StorageAssertions;

impl StorageAssertionsStrategy for StorageAssertions {
    fn invoke_assert_upload_asset(
        &self,
        _caller: &Principal,
        _asset: &AssetAssertUpload,
    ) -> Result<(), String> {
        // No pre-assertions on the mission control
        Ok(())
    }

    fn increment_and_assert_storage_usage(
        &self,
        _caller: &Principal,
        _controllers: &Controllers,
        _collection: &CollectionKey,
        _max_changes_per_user: Option<u32>,
    ) -> Result<(), String> {
        // No pre-assertions on the mission control
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
        let content_chunks = clone_asset_encoding_content_chunks(encoding, chunk_index);
        Some(content_chunks)
    }

    fn get_public_asset(
        &self,
        full_path: FullPath,
        token: Option<String>,
    ) -> Option<(Asset, Memory)> {
        junobuild_cdn::storage::heap::get_public_asset(&CdnHeap, full_path, token)
    }

    fn get_rule(&self, collection: &CollectionKey) -> Result<Rule, String> {
        junobuild_cdn::storage::heap::get_rule(&CdnHeap, collection)
    }

    fn get_config(&self) -> StorageConfig {
        get_storage_config()
    }

    fn get_domains(&self) -> CustomDomains {
        junobuild_cdn::storage::heap::get_domains(&CdnHeap)
    }

    fn get_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        junobuild_cdn::storage::heap::get_asset(&CdnHeap, full_path)
    }

    fn insert_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        _rule: &Rule,
    ) {
        junobuild_cdn::storage::heap::insert_asset(&CdnHeap, full_path, asset)
    }

    fn delete_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Option<Asset> {
        junobuild_cdn::storage::heap::delete_asset(&CdnHeap, full_path)
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
        _rule: &Rule,
    ) {
        junobuild_cdn::storage::stable::insert_asset_encoding(
            &CdnStable,
            full_path,
            encoding_type,
            encoding,
            asset,
        );
    }

    fn insert_asset(&self, batch: &Batch, asset: &Asset, _rule: &Rule) -> Result<(), String> {
        match &batch.reference_id {
            Some(reference_id) => {
                junobuild_cdn::storage::stable::insert_asset(
                    &CdnStable,
                    reference_id,
                    &batch.key.collection,
                    &batch.key.full_path,
                    asset,
                );
                Ok(())
            }
            None => Err("Cannot insert asset with unknown reference / proposal ID.".to_string()),
        }
    }

    fn get_asset(
        &self,
        reference_id: &Option<ReferenceId>,
        collection: &CollectionKey,
        full_path: &FullPath,
        _rule: &Rule,
    ) -> Result<Option<Asset>, String> {
        match reference_id {
            Some(reference_id) => {
                let asset = junobuild_cdn::storage::stable::get_asset(
                    &CdnStable,
                    reference_id,
                    collection,
                    full_path,
                );
                Ok(asset)
            }
            None => Err("Cannot get asset with unknown reference / proposal ID.".to_string()),
        }
    }
}
