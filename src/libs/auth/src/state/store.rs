use crate::state::assert::assert_set_config;
use crate::state::heap::get_config;
use crate::state::heap::insert_config;
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

    insert_config(auth_heap, &config);

    Ok(config)
}
