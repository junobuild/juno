use crate::auth::state::{get_config as get_state_config, insert_config as insert_state_config};
use crate::auth::types::state::AuthenticationConfig;

///
/// Config
///

pub fn set_config_store(config: &AuthenticationConfig) {
    insert_state_config(config);
}

pub fn get_config_store() -> Option<AuthenticationConfig> {
    get_state_config()
}
