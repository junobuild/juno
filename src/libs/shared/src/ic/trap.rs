use ic_cdk::trap;
use std::fmt::Display;

/// Unwraps a `Result<T, String>` or traps with the error message.
pub trait UnwrapOrTrap<T> {
    /// Returns the contained `Ok(T)` value, or traps with the contained error message.
    ///
    /// # Panics
    /// Traps the canister execution with the error string.
    fn unwrap_or_trap(self) -> T;
}

impl<T, E: Display> UnwrapOrTrap<T> for Result<T, E> {
    #[inline]
    fn unwrap_or_trap(self) -> T {
        self.unwrap_or_else(|e| trap(e.to_string()))
    }
}
