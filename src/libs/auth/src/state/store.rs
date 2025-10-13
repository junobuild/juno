use crate::heap::{get_config, insert_config as insert_state_config};
use crate::state::assert::assert_set_config;
use crate::strategies::AuthHeapStrategy;
use crate::types::config::AuthenticationConfig;
use crate::types::interface::SetAuthenticationConfig;

pub fn set_config(
    auth_heap: &impl AuthHeapStrategy,
    proposed_config: &SetAuthenticationConfig,
) -> Result<AuthenticationConfig, String> {
    let current_config = get_config(auth_heap);

    assert_set_config(proposed_config, &current_config)?;

    let config = AuthenticationConfig::prepare(&current_config, proposed_config);

    insert_state_config(auth_heap, &config);

    Ok(config)
}
