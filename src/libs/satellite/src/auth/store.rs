use crate::auth::types::state::AuthenticationConfig;
use crate::memory::STATE;

///
/// Config
///

pub fn set_config_store(config: &AuthenticationConfig) {
    // insert_state_config(config);
}

pub fn get_config_store() -> AuthenticationConfig {
    get_state_config()
}

///
/// Config
///

pub fn get_config() -> Option<AuthenticationConfig> {
    STATE.with(|state| state.borrow().heap.authentication.config.clone())
}

pub fn insert_config(config: &AuthenticationConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn insert_config_impl(config: &AuthenticationConfig, state: &mut AuthenticationConfig) {
    state.config = config.clone();
}
