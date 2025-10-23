use crate::memory::state::services::{with_heap_authentication, with_heap_authentication_mut};
use junobuild_auth::state::types::state::AuthenticationHeapState;
use junobuild_auth::strategies::AuthHeapStrategy;

pub struct AuthHeap;

impl AuthHeapStrategy for AuthHeap {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
        with_heap_authentication(|authentication| f(authentication))
    }

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R {
        with_heap_authentication_mut(|authentication| f(authentication))
    }
}
