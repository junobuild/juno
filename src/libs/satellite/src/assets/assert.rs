use crate::assets::cdn::constants::{CDN_JUNO_PATH, CDN_JUNO_RELEASES_COLLECTION_KEY};
use junobuild_cdn::storage::assert_releases_description;
use junobuild_cdn::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::regex::build_regex;
use junobuild_storage::types::state::FullPath;

pub fn assert_cdn_asset_keys(
    full_path: &FullPath,
    description: &Option<String>,
    collection: &CollectionKey,
) -> Result<(), String> {
    match collection.as_str() {
        CDN_JUNO_RELEASES_COLLECTION_KEY => {
            assert_releases_keys(full_path)?;
            assert_releases_description(description)?;

            Ok(())
        }
        _ => {
            if full_path.starts_with(CDN_JUNO_PATH) {
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
    let full_path_re = build_regex(r"^/_juno/releases/satellite[^/]*\.wasm\.gz$")?;

    if !full_path_re.is_match(full_path) {
        return Err(format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
        ));
    }

    Ok(())
}
