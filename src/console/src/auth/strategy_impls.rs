use crate::store::{mutate_heap_state, read_heap_state};
use junobuild_auth::strategies::AuthHeapStrategy;
use junobuild_auth::types::state::AuthenticationHeapState;

pub struct AuthHeap;

impl AuthHeapStrategy for AuthHeap {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
        read_heap_state(|state| {
            let authentication = &state.authentication;
            f(&authentication)
        })
    }

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R {
        mutate_heap_state(|state| f(&mut state.authentication))
    }
}
