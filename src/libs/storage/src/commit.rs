use crate::types::store::{Asset, AssetAssertUpload, AssetEncoding};
use candid::Principal;
use junobuild_collections::types::rules::Rule;

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
