use crate::auth::alternative_origins::update_alternative_origins;
use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::state::{get_config as get_state_config, set_config as set_store_config};
use junobuild_auth::types::config::AuthenticationConfig;
use junobuild_auth::types::interface::SetAuthenticationConfig;

pub async fn set_config(
    proposed_config: &SetAuthenticationConfig,
) -> Result<AuthenticationConfig, String> {
    let config = set_store_config(&AuthHeap, proposed_config)?;

    update_alternative_origins(&config)?;

    if config.google.is_some() {
        junobuild_auth::state::init_salt(&AuthHeap).await?;
    }

    Ok(config)
}

pub fn get_config() -> Option<AuthenticationConfig> {
    get_state_config(&AuthHeap)
}
