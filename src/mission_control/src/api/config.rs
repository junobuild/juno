use crate::guards::caller_is_user_or_admin_controller;
use crate::types::state::Config;
use crate::user::store::{get_config as get_config_store, set_config as set_config_store};
use ic_cdk_macros::{query, update};

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
