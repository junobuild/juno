use crate::get_access_keys;
use junobuild_auth::strategies::AuthAutomationStrategy;
use junobuild_shared::types::state::Controllers;

pub struct AuthAutomation;

impl AuthAutomationStrategy for AuthAutomation {
    fn get_controllers(&self) -> Controllers {
        get_access_keys()
    }
}
