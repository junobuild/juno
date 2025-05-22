use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::StorageState;
use crate::guards::caller_is_admin_controller;
use crate::types::interface::Config;
use ic_cdk_macros::{query, update};
use junobuild_storage::types::config::StorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

#[query(guard = "caller_is_admin_controller")]
pub fn get_config() -> Config {
    let storage = junobuild_cdn::storage::heap::get_config(&CdnHeap);
    Config { storage }
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
pub fn set_storage_config(config: StorageConfig) {
    junobuild_cdn::storage::set_config_store(&CdnHeap, &StorageState, &config);
}

#[query(guard = "caller_is_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    junobuild_cdn::storage::heap::get_config(&CdnHeap)
}
