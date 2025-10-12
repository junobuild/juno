use crate::strategies::AuthHeapStrategy;
use crate::types::config::AuthenticationConfig;
use crate::types::state::AuthenticationHeapState;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config(auth_heap: &impl AuthHeapStrategy) -> Option<AuthenticationConfig> {
    auth_heap
        .with_auth_state(|authentication| authentication.as_ref().map(|auth| auth.config.clone()))
}

pub fn insert_config(auth_heap: &impl AuthHeapStrategy, config: &AuthenticationConfig) {
    auth_heap.with_auth_state_mut(|authentication| insert_config_impl(config, authentication))
}

fn insert_config_impl(config: &AuthenticationConfig, state: &mut Option<AuthenticationHeapState>) {
    match state {
        None => {
            *state = Some(AuthenticationHeapState {
                config: config.clone(),
            })
        }
        Some(state) => state.config = config.clone(),
    }
}
