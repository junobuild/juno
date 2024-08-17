use crate::types::config::StorageConfig;
use crate::types::state::FullPath;
use crate::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, Batch, EncodingType, ReferenceId,
};
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::domain::CustomDomains;

pub trait StorageAssertionsStrategy {
    fn invoke_assert_upload_asset(
        &self,
        caller: &Principal,
        asset: &AssetAssertUpload,
    ) -> Result<(), String>;
}

pub trait StorageStateStrategy {
    fn get_content_chunks(
        &self,
        encoding: &AssetEncoding,
        chunk_index: usize,
        memory: &Memory,
    ) -> Option<Blob>;

    fn get_public_asset(
        &self,
        full_path: FullPath,
        token: Option<String>,
    ) -> Option<(Asset, Memory)>;

    fn get_rule(&self, collection: &CollectionKey) -> Result<Rule, String>;

    fn get_config(&self) -> StorageConfig;

    fn get_domains(&self) -> CustomDomains;

    fn get_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Option<Asset>;

    fn insert_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        rule: &Rule,
    );

    fn delete_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Option<Asset>;
}

pub trait StorageUploadStrategy {
    fn insert_asset_encoding(
        &self,
        full_path: &FullPath,
        encoding_type: &EncodingType,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        rule: &Rule,
    );

    fn insert_asset(&self, batch: &Batch, asset: &Asset, rule: &Rule) -> Result<(), String>;

    fn get_asset(
        &self,
        reference_id: &Option<ReferenceId>,
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Result<Option<Asset>, String>;
}
