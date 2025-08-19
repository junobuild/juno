use crate::assets::assert::assert_cdn_asset_keys;
use crate::assets::storage::assert::assert_storage_list_permission;
use crate::assets::storage::state::{
    delete_asset, get_asset, get_config, get_domains, get_rule, insert_asset, insert_asset_encoding,
};
use crate::assets::storage::store::{get_content_chunks_store, get_public_asset_store};
use crate::hooks::storage::invoke_assert_upload_asset;
use crate::user::usage::assert::increment_and_assert_storage_usage;
use candid::Principal;
use junobuild_collections::assert::stores::{assert_create_permission, assert_permission};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Permission, Rule};
use junobuild_shared::controllers::controller_can_write;
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
        collection: &CollectionKey,
        controllers: &Controllers,
    ) -> bool {
        assert_storage_list_permission(permission, owner, caller, collection, controllers)
    }

    fn invoke_assert_upload_asset(
        &self,
        caller: &Principal,
        asset: &AssetAssertUpload,
    ) -> Result<(), String> {
        invoke_assert_upload_asset(caller, asset)
    }

    fn increment_and_assert_storage_usage(
        &self,
        caller: &Principal,
        controllers: &Controllers,
        collection: &CollectionKey,
        max_changes_per_user: Option<u32>,
    ) -> Result<(), String> {
        increment_and_assert_storage_usage(*caller, controllers, collection, max_changes_per_user)
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
        _reference_id: &Option<ReferenceId>,
        full_path: &FullPath,
        encoding_type: &EncodingType,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        rule: &Rule,
    ) -> Result<(), String> {
        insert_asset_encoding(full_path, encoding_type, encoding, asset, rule);
        Ok(())
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
