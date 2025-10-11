use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::{StorageCertificate, StorageState};
use crate::guards::caller_is_admin_controller;
use crate::types::interface::Config;
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;

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
pub fn set_storage_config(config: SetStorageConfig) -> StorageConfig {
    junobuild_cdn::storage::set_config_store(&CdnHeap, &StorageState, &StorageCertificate, &config)
        .unwrap_or_trap()
}

#[query(guard = "caller_is_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    junobuild_cdn::storage::heap::get_config(&CdnHeap)
}
