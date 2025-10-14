use crate::auth::alternative_origins::update_alternative_origins;
use crate::auth::salt::init_salt;
use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::state::{
    get_config as get_state_config, get_salt as get_state_salt, insert_salt,
    set_config as set_store_config,
};
use junobuild_auth::types::config::AuthenticationConfig;
use junobuild_auth::types::interface::SetAuthenticationConfig;
use junobuild_auth::types::state::Salt;

pub async fn set_config(
    proposed_config: &SetAuthenticationConfig,
) -> Result<AuthenticationConfig, String> {
    let config = set_store_config(&AuthHeap, &proposed_config)?;

    update_alternative_origins(&config)?;

    if config.google.is_some() {
        init_salt().await?;
    }

    Ok(config)
}

pub fn get_config() -> Option<AuthenticationConfig> {
    get_state_config(&AuthHeap)
}

pub fn set_salt(salt: &Salt) {
    insert_salt(&AuthHeap, salt);
}

pub fn get_salt() -> Option<Salt> {
    get_state_salt(&AuthHeap)
}
