use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;
use crate::assets::storage::store::set_config_store;
use crate::assets::storage::certified_assets::all::certify_all_assets;

pub fn apply_storage_config(config: &SetStorageConfig) -> Result<StorageConfig, String> {
    let stored_config = set_config_store(config)?;

    // For backwards compatibility, none means certify all runtime assets now
    if config.skip_certification != Some(false) {
        certify_all_assets();
    }

    Ok(stored_config)
}