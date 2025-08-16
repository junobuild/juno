use candid::Principal;
use junobuild_shared::ic::{caller as shared_caller, id as shared_id};

/// Returns the **principal** of the current satellite.
///
/// # Example
/// ```ignore
/// let current_module = junobuild_satellite::id();
/// ```
pub fn id() -> Principal {
    shared_id()
}

/// Returns the **principal** of the caller that invoked the current satellite.
///
/// # Example
/// ```ignore
/// let user = junobuild_satellite::caller();
/// ```
pub fn caller() -> Principal {
    shared_caller()
}
