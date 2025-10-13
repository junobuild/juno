use crate::types::state::{AuthenticationHeapState, Salt};

pub trait AuthHeapStrategy {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R;

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R;
}

pub trait AuthCertificateStrategy {
    fn update_certified_data(&self);

    fn salt(&self) -> Option<Salt>;
}
