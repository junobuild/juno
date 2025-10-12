use crate::types::state::AuthenticationHeapState;

pub trait AuthHeapStrategy {
    fn with_auth_state<R>(&self, f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R;

    fn with_auth_state_mut<R>(
        &self,
        f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R,
    ) -> R;
}
