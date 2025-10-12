use crate::auth::alternative_origins::update_alternative_origins;
use crate::auth::assert::config::assert_set_config;
use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::heap::{get_config as get_state_config, insert_config as insert_state_config};
use junobuild_auth::types::config::AuthenticationConfig;
use junobuild_auth::types::interface::SetAuthenticationConfig;

pub fn set_config(
    proposed_config: &SetAuthenticationConfig,
) -> Result<AuthenticationConfig, String> {
    let current_config = get_config();

    assert_set_config(proposed_config, &current_config)?;

    let config = AuthenticationConfig::prepare(&current_config, proposed_config);

    insert_state_config(&AuthHeap, &config);

    update_alternative_origins(&config)?;

    Ok(config)
}

pub fn get_config() -> Option<AuthenticationConfig> {
    get_state_config(&AuthHeap)
}
