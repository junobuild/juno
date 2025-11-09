use crate::store::{with_auth, with_auth_mut};
use junobuild_auth::state::types::state::AuthenticationHeapState;
use junobuild_auth::strategies::AuthHeapStrategy;

pub struct AuthHeap;

impl AuthHeapStrategy for AuthHeap {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
        with_auth(f)
    }

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R {
        with_auth_mut(f)
    }
}
