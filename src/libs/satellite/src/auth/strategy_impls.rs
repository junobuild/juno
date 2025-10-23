use crate::memory::state::STATE;
use junobuild_auth::state::types::state::AuthenticationHeapState;
use junobuild_auth::strategies::AuthHeapStrategy;

pub struct AuthHeap;

impl AuthHeapStrategy for AuthHeap {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
        STATE.with(|state| {
            let authentication = &state.borrow().heap.authentication;
            f(authentication)
        })
    }

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.heap.authentication)
        })
    }
}
