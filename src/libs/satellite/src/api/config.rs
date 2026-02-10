use crate::assets::storage::store::{
    get_config_store as get_storage_config_store, set_config_store as set_storage_config_store,
};
use crate::auth::store::{
    get_config as get_auth_config_store, set_config as set_auth_config_store,
};
use crate::automation::store::{
    get_config as get_automation_config_store, set_config as set_automation_config_store,
};
use crate::db::store::{
    get_config_store as get_db_config_store, set_config_store as set_db_config_store,
};
use crate::db::types::config::DbConfig;
use crate::db::types::interface::SetDbConfig;
use crate::types::interface::Config;
use junobuild_auth::state::types::automation::AutomationConfig;
use junobuild_auth::state::types::config::AuthenticationConfig;
use junobuild_auth::state::types::interface::{SetAuthenticationConfig, SetAutomationConfig};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> Config {
    let storage = get_storage_config_store();
    let db = get_db_config_store();
    let authentication = get_auth_config_store();
    let automation = get_automation_config_store();

    Config {
        storage,
        db,
        authentication,
        automation,
    }
}

// ---------------------------------------------------------
// Authentication config
// ---------------------------------------------------------

pub async fn set_auth_config(config: SetAuthenticationConfig) -> AuthenticationConfig {
    set_auth_config_store(&config).await.unwrap_or_trap()
}

pub fn get_auth_config() -> Option<AuthenticationConfig> {
    get_auth_config_store()
}

// ---------------------------------------------------------
// Automation config
// ---------------------------------------------------------

pub async fn set_automation_config(config: SetAutomationConfig) -> AutomationConfig {
    set_automation_config_store(&config).await.unwrap_or_trap()
}

pub fn get_automation_config() -> Option<AutomationConfig> {
    get_automation_config_store()
}

// ---------------------------------------------------------
// Db config
// ---------------------------------------------------------

pub fn set_db_config(config: SetDbConfig) -> DbConfig {
    set_db_config_store(&config).unwrap_or_trap()
}

pub fn get_db_config() -> Option<DbConfig> {
    get_db_config_store()
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

pub fn set_storage_config(config: SetStorageConfig) -> StorageConfig {
    set_storage_config_store(&config).unwrap_or_trap()
}

pub fn get_storage_config() -> StorageConfig {
    get_storage_config_store()
}
