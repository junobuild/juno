use crate::assets::storage::state::{delete_asset, insert_asset, insert_asset_encoding};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};

/// Insert an asset directly into the state.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_insert_asset(
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    rule: &Rule,
) {
    insert_asset(collection, full_path, asset, rule)
}

/// Insert encoding into the asset or within the stable tree map.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_insert_asset_encoding(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
    rule: &Rule,
) {
    insert_asset_encoding(full_path, encoding_type, encoding, asset, rule)
}

/// Deletes an asset directly from the state.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_delete_asset(
    collection: &CollectionKey,
    full_path: &FullPath,
    rule: &Rule,
) -> Option<Asset> {
    delete_asset(collection, full_path, rule)
}
