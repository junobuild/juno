use crate::types::config::StorageConfig;
use crate::types::state::{AssetsHeap, AssetsStable, FullPath};
use crate::types::store::{Asset, AssetAssertUpload, AssetEncoding};
use candid::Principal;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::{Blob, CollectionKey};

pub trait AssertOperations {
    fn invoke_assert_upload_asset(
        &self,
        caller: &Principal,
        asset: &AssetAssertUpload,
    ) -> Result<(), String>;
}

pub trait InsertOperations {
    fn insert_state_asset_encoding(
        &self,
        full_path: &String,
        encoding_type: &String,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        rule: &Rule,
    );

    fn insert_state_asset(
        &self,
        collection: &String,
        full_path: &String,
        asset: &Asset,
        rule: &Rule,
    );
}

pub trait ContentStore {
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

    fn get_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        rule: &Rule,
    ) -> Option<Asset>;

    fn get_rule(&self, collection: &CollectionKey) -> Result<Rule, String>;

    fn get_config(&self) -> StorageConfig;
}
