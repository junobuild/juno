use crate::cdn::constants::{CDN_JUNO_COLLECTION_KEY, CDN_JUNO_COLLECTION_PATH};
use junobuild_cdn::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::regex::build_regex;
use junobuild_storage::types::state::FullPath;

// TODO: storage module uses cdn because of this reference. Refactor modules.

pub fn assert_cdn_asset_keys(
    full_path: &FullPath,
    collection: &CollectionKey,
) -> Result<(), String> {
    match collection.as_str() {
        CDN_JUNO_COLLECTION_KEY => assert_releases_keys(full_path),
        _ => {
            if full_path.starts_with(CDN_JUNO_COLLECTION_PATH) {
                return Err(format!(
                    "{} ({} - {})",
                    JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, full_path, collection
                ));
            }

            Ok(())
        }
    }
}

fn assert_releases_keys(full_path: &FullPath) -> Result<(), String> {
    let re = build_regex(r"^/_juno/releases/satellite[^/]*\.wasm\.gz$")?;

    if !re.is_match(full_path) {
        return Err(format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
        ));
    }

    Ok(())
}
