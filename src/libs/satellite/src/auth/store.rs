use crate::auth::alternative_origins::update_alternative_origins;
use crate::auth::state::{get_config as get_state_config, insert_config as insert_state_config};
use crate::auth::types::state::AuthenticationConfig;

pub fn set_config(config: &AuthenticationConfig) -> Result<(), String> {
    insert_state_config(config);

    update_alternative_origins(config)
}

pub fn get_config() -> Option<AuthenticationConfig> {
    get_state_config()
}
