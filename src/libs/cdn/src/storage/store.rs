use crate::storage::heap::insert_config;
use crate::storage::init_certified_assets;
use crate::strategies::CdnHeapStrategy;
use junobuild_storage::strategies::StorageStateStrategy;
use junobuild_storage::types::config::StorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn set_config_store(
    cdn_heap: &impl CdnHeapStrategy,
    storage_state: &impl StorageStateStrategy,
    config: &StorageConfig,
) {
    insert_config(cdn_heap, config);

    init_certified_assets(cdn_heap, storage_state);
}
