use crate::storage::state::{insert_asset, insert_asset_encoding};
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::CollectionKey;
use junobuild_storage::strategies::StorageUploadStrategy;
use junobuild_storage::types::state::{BatchId, FullPath};
use junobuild_storage::types::store::{Asset, AssetEncoding};

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
        insert_asset_encoding(full_path, encoding_type, encoding, asset);
    }

    fn insert_asset(
        &self,
        batch_id: &BatchId,
        collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        _rule: &Rule,
    ) {
        insert_asset(batch_id, collection, full_path, asset);
    }
}
