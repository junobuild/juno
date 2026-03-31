use crate::assets::storage::certified_assets::all::certify_all_assets;
use crate::assets::storage::store::set_config_store;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;

pub fn apply_storage_config(
    config: &SetStorageConfig,
    skip_certification: Option<bool>,
) -> Result<StorageConfig, String> {
    let stored_config = set_config_store(config)?;

    if skip_certification != Some(true) {
        certify_all_assets();
    }

    Ok(stored_config)
}
