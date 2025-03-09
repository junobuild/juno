use crate::auth::types::config::AuthenticationConfig;
use crate::auth::types::state::AuthenticationHeapState;
use crate::memory::internal::STATE;

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
            })
        }
        Some(state) => state.config = config.clone(),
    }
}
