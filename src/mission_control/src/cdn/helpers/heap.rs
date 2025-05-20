use crate::cdn::strategies_impls::cdn::CdnHeap;
use junobuild_storage::types::config::StorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_storage_config() -> StorageConfig {
    junobuild_cdn::storage::heap::get_config(&CdnHeap)
}
