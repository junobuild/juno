use crate::assets::storage::store::{
    get_config_store as get_storage_config_store, set_config_store as set_storage_config_store,
};
use crate::auth::store::{
    get_config as get_auth_config_store, set_config as set_auth_config_store,
};
use crate::auth::types::config::AuthenticationConfig;
use crate::db::store::{
    get_config_store as get_db_config_store, set_config_store as set_db_config_store,
};
use crate::db::types::config::DbConfig;
use crate::types::interface::Config;
use ic_cdk::trap;
use junobuild_storage::types::config::StorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> Config {
    let storage = get_storage_config_store();
    let db = get_db_config_store();
    let authentication = get_auth_config_store();

    Config {
        storage,
        db,
        authentication,
    }
}

// ---------------------------------------------------------
// Authentication config
// ---------------------------------------------------------

pub fn set_auth_config(config: AuthenticationConfig) {
    set_auth_config_store(&config).unwrap_or_else(|e| trap(&e));
}

pub fn get_auth_config() -> Option<AuthenticationConfig> {
    get_auth_config_store()
}

// ---------------------------------------------------------
// Db config
// ---------------------------------------------------------

pub fn set_db_config(config: DbConfig) {
    set_db_config_store(&config);
}

pub fn get_db_config() -> Option<DbConfig> {
    get_db_config_store()
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

pub fn set_storage_config(config: StorageConfig) {
    set_storage_config_store(&config);
}

pub fn get_storage_config() -> StorageConfig {
    get_storage_config_store()
}
