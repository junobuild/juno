use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;
use crate::assets::storage::state::{delete_asset};

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