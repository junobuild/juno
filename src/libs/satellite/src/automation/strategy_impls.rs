use crate::get_access_keys;
use junobuild_auth::strategies::AuthAutomationStrategy;
use junobuild_shared::types::state::AccessKeys;

pub struct AuthAutomation;

impl AuthAutomationStrategy for AuthAutomation {
    fn get_controllers(&self) -> AccessKeys {
        get_access_keys()
    }
}
