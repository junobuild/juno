use crate::auth::types::state::AuthenticationConfig;

impl Default for AuthenticationConfig {
    fn default() -> Self {
        AuthenticationConfig {
            internet_identity: None,
        }
    }
}
