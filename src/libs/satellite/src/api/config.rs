use crate::auth::types::config::AuthenticationConfig;
use crate::db::types::config::DbConfig;
use crate::types::interface::Config;
use ic_cdk::trap;
use junobuild_storage::types::config::StorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> Config {
    let storage = crate::storage::store::get_config_store();
    let db = crate::db::store::get_config_store();
    let authentication = crate::auth::store::get_config();

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
    crate::auth::store::set_config(&config).unwrap_or_else(|e| trap(&e));
}

pub fn get_auth_config() -> Option<AuthenticationConfig> {
    crate::auth::store::get_config()
}

// ---------------------------------------------------------
// Db config
// ---------------------------------------------------------

pub fn set_db_config(config: DbConfig) {
    crate::db::store::set_config_store(&config);
}

pub fn get_db_config() -> Option<DbConfig> {
    crate::db::store::get_config_store()
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

pub fn set_storage_config(config: StorageConfig) {
    crate::storage::store::set_config_store(&config);
}

pub fn get_storage_config() -> StorageConfig {
    crate::storage::store::get_config_store()
}
