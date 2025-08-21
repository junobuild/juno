use crate::memory::internal::STATE;
use junobuild_auth::types::config::AuthenticationConfig;
use junobuild_auth::types::state::AuthenticationHeapState;
use junobuild_auth::types::state::Salt;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> Option<AuthenticationConfig> {
    STATE.with(|state| {
        state
            .borrow()
            .heap
            .authentication
            .as_ref()
            .map(|auth| auth.config.clone())
    })
}

pub fn insert_config(config: &AuthenticationConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.authentication))
}

fn insert_config_impl(config: &AuthenticationConfig, state: &mut Option<AuthenticationHeapState>) {
    match state {
        None => {
            *state = Some(AuthenticationHeapState {
                config: config.clone(),
                salt: None,
            })
        }
        Some(state) => state.config = config.clone(),
    }
}

// ---------------------------------------------------------
// Salt
// ---------------------------------------------------------

pub fn get_salt() -> Option<Salt> {
    STATE.with(|state| {
        state
            .borrow()
            .heap
            .authentication
            .as_ref()
            .and_then(|auth| auth.salt)
    })
}

pub fn insert_salt(salt: &Salt) {
    STATE.with(|state| insert_salt_impl(salt, &mut state.borrow_mut().heap.authentication))
}

fn insert_salt_impl(salt: &Salt, state: &mut Option<AuthenticationHeapState>) {
    match state {
        None => {
            *state = Some(AuthenticationHeapState {
                config: AuthenticationConfig::default(),
                salt: Some(*salt),
            })
        }
        Some(state) => state.salt = Some(*salt),
    }
}
