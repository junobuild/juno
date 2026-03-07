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

impl<T> UnwrapOrTrap<T> for Option<T> {
    #[inline]
    fn unwrap_or_trap(self) -> T {
        self.unwrap_or_else(|| trap("Expected a result to return but got none"))
    }
}

/// Unwraps a `Result<Option<T>, E>` into `T`, trapping on either failure.
pub trait UnwrapOrTrapResult<T> {
    /// Returns the contained `Ok(Some(T))` value, or traps.
    ///
    /// # Panics
    /// Traps the canister execution with the error message if the `Result` is `Err`,
    /// or with a default message if the `Option` is `None`.
    fn unwrap_or_trap_result(self) -> T;
}

impl<T, E: Display> UnwrapOrTrapResult<T> for Result<Option<T>, E> {
    #[inline]
    fn unwrap_or_trap_result(self) -> T {
        self.unwrap_or_trap().unwrap_or_trap()
    }
}
