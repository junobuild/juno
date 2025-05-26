use crate::cdn::constants::{RELEASES_COLLECTION_KEY, RELEASES_COLLECTION_PATH};
use junobuild_cdn::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::regex::build_regex;
use junobuild_storage::types::state::FullPath;

pub fn assert_cdn_asset_keys(
    full_path: &FullPath,
    collection: &CollectionKey,
) -> Result<(), String> {
    match collection {
        RELEASES_COLLECTION_KEY => assert_releases_keys(full_path),
        _ => {
            if full_path.starts_with(RELEASES_COLLECTION_PATH) {
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
    if full_path == "/releases/metadata.json" {
        return Err(format!("{} is a reserved asset.", full_path).to_string());
    }

    if full_path.starts_with("/releases/satellite")
        || full_path.starts_with("/releases/mission_control")
        || full_path.starts_with("/releases/orbiter")
    {
        let re = build_regex(
            r"^/releases/(satellite|mission_control|orbiter)-v\d+\.\d+\.\d+\.wasm\.gz$",
        )?;

        return if re.is_match(full_path) {
            Ok(())
        } else {
            Err(format!(
                "{} ({})",
                JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
            ))
        };
    }

    Ok(())
}
