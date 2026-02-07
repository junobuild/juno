use crate::state::types::state::AuthenticationHeapState;
use ic_certification::Hash;
use junobuild_shared::types::state::Controllers;

pub trait AuthHeapStrategy {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R;

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R;
}

pub trait AuthCertificateStrategy {
    fn update_certified_data(&self);

    fn get_asset_hashes_root_hash(&self) -> Hash;
}

pub trait AuthAutomationStrategy {
    fn get_controllers(&self) -> Controllers;
}
