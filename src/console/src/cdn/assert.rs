use crate::cdn::constants::{RELEASES_COLLECTION_KEY, RELEASES_COLLECTION_PATH};
use junobuild_cdn::storage::errors::JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION;
use junobuild_collections::types::core::CollectionKey;
use junobuild_storage::types::state::FullPath;

pub fn assert_cdn_asset_keys(
    full_path: &FullPath,
    collection: &CollectionKey,
) -> Result<(), String> {
    if full_path.starts_with(RELEASES_COLLECTION_PATH) && collection != RELEASES_COLLECTION_KEY {
        return Err(format!(
            "{} ({} - {})",
            JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, full_path, collection
        ));
    }

    Ok(())
}
