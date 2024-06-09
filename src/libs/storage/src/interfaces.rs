use crate::types::state::FullPath;
use crate::types::store::{Asset, AssetAssertUpload, AssetEncoding};
use candid::Principal;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::Blob;

pub trait AssertOperations {
    fn invoke_assert_upload_asset(
        &self,
        caller: &Principal,
        asset_assert_upload: &AssetAssertUpload,
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
    fn get_content_chunks_store(
        &self,
        encoding: &AssetEncoding,
        chunk_index: usize,
        memory: &Memory,
    ) -> Option<Blob>;

    fn get_public_asset_store(
        &self,
        full_path: FullPath,
        token: Option<String>,
    ) -> Option<(Asset, Memory)>;
}
