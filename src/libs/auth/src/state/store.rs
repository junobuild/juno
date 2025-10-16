use crate::state::assert::assert_set_config;
use crate::state::heap::get_config;
use crate::state::heap::insert_config;
use crate::state::types::config::AuthenticationConfig;
use crate::state::types::interface::SetAuthenticationConfig;
use crate::state::{get_salt, insert_salt};
use crate::strategies::AuthHeapStrategy;
use junobuild_shared::ic::api::print;
use junobuild_shared::random::raw_rand;

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

pub async fn init_salt(auth_heap: &impl AuthHeapStrategy) -> Result<(), String> {
    let existing_salt = get_salt(auth_heap);

    // Salt should be initialized only once.
    if existing_salt.is_some() {
        #[allow(clippy::disallowed_methods)]
        print("Authentication salt exists. Skipping initialization.");
        return Ok(());
    }

    let salt = raw_rand()
        .await
        .map_err(|e| format!("Failed to obtain authentication seed: {:?}", e))?;

    insert_salt(auth_heap, &salt);

    #[allow(clippy::disallowed_methods)]
    print("Authentication salt initialized.");

    Ok(())
}
