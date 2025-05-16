use crate::memory::STATE;
use crate::storage::state::heap::{
    delete_asset, get_asset, get_config, get_domains, get_rule, insert_asset,
};
use crate::storage::state::stable::{
    get_asset_stable, insert_asset_encoding_stable, insert_asset_stable,
};
use crate::storage::state::utils::get_content_chunks;
use crate::storage::store::get_public_asset;
use candid::Principal;
use junobuild_cdn::strategies::CdnHeapStrategy;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule, Rules};
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{AssetsHeap, FullPath};
use junobuild_storage::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, Batch, EncodingType, ReferenceId,
};

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

    fn increment_and_assert_storage_usage(
        &self,
        _caller: &Principal,
        _controllers: &Controllers,
        _collection: &CollectionKey,
        _max_changes_per_user: Option<u32>,
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
        encoding_type: &EncodingType,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        _rule: &Rule,
    ) {
        insert_asset_encoding_stable(full_path, encoding_type, encoding, asset);
    }

    fn insert_asset(&self, batch: &Batch, asset: &Asset, _rule: &Rule) -> Result<(), String> {
        match &batch.reference_id {
            Some(reference_id) => {
                insert_asset_stable(
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
                let asset = get_asset_stable(reference_id, collection, full_path);
                Ok(asset)
            }
            None => Err("Cannot get asset with unknown reference / proposal ID.".to_string()),
        }
    }
}

pub struct CdnHeap;

impl CdnHeapStrategy for CdnHeap {
    fn with_config<R>(&self, f: impl FnOnce(&StorageConfig) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.config)
        })
    }

    fn with_config_mut<R>(&self, f: impl FnOnce(&mut StorageConfig) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.heap.storage.config)
        })
    }

    fn with_assets<R>(&self, f: impl FnOnce(&AssetsHeap) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.assets)
        })
    }

    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut AssetsHeap) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.heap.storage.assets)
        })
    }

    fn with_rules<R>(&self, f: impl FnOnce(&Rules) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.rules)
        })
    }
}
