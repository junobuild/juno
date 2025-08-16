use candid::Principal;
use ic_cdk::api::{canister_self, debug_print, msg_caller};

/// Returns the **principal** of the current module.
///
/// This is a shorthand for [`ic_cdk::api::canister_self`],
/// kept for readability and to align with the concise naming convention
/// used our helpers.
///
/// # Example
/// ```ignore
/// let current_module = core::ic::id();
/// ```
pub fn id() -> Principal {
    canister_self()
}

/// Returns the **principal** of the caller that invoked the current module.
///
/// This is a shorthand for [`ic_cdk::api::msg_caller`],
/// kept for readability and to align with the concise naming convention
/// used our helpers.
///
/// # Example
/// ```ignore
/// let user = core::ic::caller();
/// ```
pub fn caller() -> Principal {
    msg_caller()
}

/// Prints a debug message to the Juno runtime logs.
///
/// This is a shorthand for [`ic_cdk::api::debug_print`],  
/// kept for readability and to align with the concise naming convention
/// used in our helpers.
///
/// In the Juno Console, these messages appear in the logs of the current module.
///
/// # Example
/// ```ignore
/// core::ic::print("Satellite started successfully");
/// ```
pub fn print<S: AsRef<str>>(s: S) {
    debug_print(s)
}
