use crate::state::types::config::AuthenticationConfig;
use crate::state::types::state::AuthenticationHeapState;
use crate::state::types::state::Salt;
use crate::strategies::AuthHeapStrategy;

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
                salt: None,
                openid: None,
            })
        }
        Some(state) => state.config = config.clone(),
    }
}

// ---------------------------------------------------------
// Salt
// ---------------------------------------------------------

pub fn get_salt(auth_heap: &impl AuthHeapStrategy) -> Option<Salt> {
    auth_heap.with_auth_state(|authentication| authentication.as_ref().and_then(|auth| auth.salt))
}

pub fn insert_salt(auth_heap: &impl AuthHeapStrategy, salt: &Salt) {
    auth_heap.with_auth_state_mut(|authentication| insert_salt_impl(salt, authentication))
}

fn insert_salt_impl(salt: &Salt, state: &mut Option<AuthenticationHeapState>) {
    match state {
        None => {
            *state = Some(AuthenticationHeapState {
                config: AuthenticationConfig::default(),
                salt: Some(*salt),
                openid: None,
            })
        }
        Some(state) => state.salt = Some(*salt),
    }
}
