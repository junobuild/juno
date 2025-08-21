use crate::auth::alternative_origins::update_alternative_origins;
use crate::auth::assert::config::assert_set_config;
use crate::auth::state::{
    get_config as get_state_config, get_salt as get_state_salt,
    insert_config as insert_state_config, insert_salt,
};
use junobuild_auth::types::config::AuthenticationConfig;
use junobuild_auth::types::interface::SetAuthenticationConfig;
use junobuild_auth::types::state::Salt;

pub fn set_config(
    proposed_config: &SetAuthenticationConfig,
) -> Result<AuthenticationConfig, String> {
    let current_config = get_config();

    assert_set_config(proposed_config, &current_config)?;

    let config = AuthenticationConfig::prepare(&current_config, proposed_config);

    insert_state_config(&config);

    update_alternative_origins(&config)?;

    Ok(config)
}

pub fn get_config() -> Option<AuthenticationConfig> {
    get_state_config()
}

pub fn set_salt(salt: &Salt) {
    insert_salt(salt);
}

pub fn get_salt() -> Option<Salt> {
    get_state_salt()
}
