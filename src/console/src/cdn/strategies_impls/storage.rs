use crate::cdn::assert::assert_cdn_asset_keys;
use crate::cdn::helpers::heap::{
    delete_asset, get_asset, get_config, get_domains, get_rule, insert_asset,
};
use crate::cdn::helpers::stable::{
    get_asset_stable, insert_asset_encoding_stable, insert_asset_stable,
};
use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::certification::cert::update_certified_data;
use candid::Principal;
use junobuild_cdn::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_CANNOT_GET_ASSET_UNKNOWN_REFERENCE_ID,
    JUNO_CDN_STORAGE_ERROR_CANNOT_INSERT_ASSET_ENCODING_UNKNOWN_REFERENCE_ID,
    JUNO_CDN_STORAGE_ERROR_CANNOT_INSERT_ASSET_UNKNOWN_REFERENCE_ID,
};
use junobuild_collections::assert::stores::{assert_create_permission, assert_permission};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Permission, Rule};
use junobuild_shared::controllers::controller_can_write;
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::strategies::{
    StorageAssertionsStrategy, StorageCertificateStrategy, StorageStateStrategy,
    StorageUploadStrategy,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, Batch, EncodingType, ReferenceId,
};
use junobuild_storage::utils::clone_asset_encoding_content_chunks;

pub struct StorageAssertions;

impl StorageAssertionsStrategy for StorageAssertions {
    fn assert_key(
        &self,
        full_path: &FullPath,
        description: &Option<String>,
        collection: &CollectionKey,
    ) -> Result<(), String> {
        assert_cdn_asset_keys(full_path, description, collection)
    }

    fn assert_write_on_dapp_collection(
        &self,
        caller: Principal,
        controllers: &Controllers,
    ) -> bool {
        controller_can_write(caller, controllers)
    }

    fn assert_write_on_system_collection(
        &self,
        caller: Principal,
        _collection: &CollectionKey,
        controllers: &Controllers,
    ) -> bool {
        controller_can_write(caller, controllers)
    }

    fn assert_create_permission(
        &self,
        permission: &Permission,
        caller: Principal,
        _collection: &CollectionKey,
        controllers: &Controllers,
    ) -> bool {
        assert_create_permission(permission, caller, controllers)
    }

    fn assert_update_permission(
        &self,
        permission: &Permission,
        owner: Principal,
        caller: Principal,
        _collection: &CollectionKey,
        controllers: &Controllers,
    ) -> bool {
        assert_permission(permission, owner, caller, controllers)
    }

    fn assert_list_permission(
        &self,
        permission: &Permission,
        owner: Principal,
        caller: Principal,
        _collection: &CollectionKey,
        controllers: &Controllers,
    ) -> bool {
        assert_permission(permission, owner, caller, controllers)
    }

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
        reference_id: &Option<ReferenceId>,
        full_path: &FullPath,
        encoding_type: &EncodingType,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        _rule: &Rule,
    ) -> Result<(), String> {
        match reference_id {
            Some(reference_id) => {
                insert_asset_encoding_stable(
                    reference_id,
                    full_path,
                    encoding_type,
                    encoding,
                    asset,
                );
                Ok(())
            }
            None => Err(
                JUNO_CDN_STORAGE_ERROR_CANNOT_INSERT_ASSET_ENCODING_UNKNOWN_REFERENCE_ID
                    .to_string(),
            ),
        }
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
            None => {
                Err(JUNO_CDN_STORAGE_ERROR_CANNOT_INSERT_ASSET_UNKNOWN_REFERENCE_ID.to_string())
            }
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
            None => Err(JUNO_CDN_STORAGE_ERROR_CANNOT_GET_ASSET_UNKNOWN_REFERENCE_ID.to_string()),
        }
    }
}

pub struct StorageCertificate;

impl StorageCertificateStrategy for StorageCertificate {
    fn update_certified_data(&self) {
        update_certified_data();
    }
}
