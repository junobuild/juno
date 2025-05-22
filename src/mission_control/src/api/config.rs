use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::StorageState;
use crate::guards::caller_is_user_or_admin_controller;
use crate::types::state::Config;
use crate::user::store::{get_config as get_config_store, set_config as set_config_store};
use ic_cdk_macros::{query, update};

use crate::cdn::helpers::heap::get_storage_config as get_cdn_storage_config;
use junobuild_storage::types::config::StorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_config() -> Option<Config> {
    get_config_store()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_config(config: Option<Config>) {
    set_config_store(&config)
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn set_storage_config(config: StorageConfig) {
    junobuild_cdn::storage::set_config_store(&CdnHeap, &StorageState, &config);
}

#[query(guard = "caller_is_user_or_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    get_cdn_storage_config()
}
