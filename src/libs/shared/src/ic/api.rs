use candid::Principal;

#[cfg(target_arch = "wasm32")]
use ic_cdk::api::{
    canister_self, debug_print, is_controller as ic_is_controller, msg_caller, time as ic_time,
};

/// Returns the **principal** of the current module.
///
/// This is a shorthand for [`ic_cdk::api::canister_self`],
/// kept for readability and to align with the concise naming convention
/// used our helpers.
///
/// # Example
/// ```ignore
/// let current_module = ic::api::id();
/// ```
#[cfg(target_arch = "wasm32")]
pub fn id() -> Principal {
    canister_self()
}

#[cfg(not(target_arch = "wasm32"))]
pub fn id() -> Principal {
    Principal::from_text("ck4tp-3iaaa-aaaal-ab7da-cai").unwrap()
}

/// Returns the **principal** of the caller that invoked the current module.
///
/// This is a shorthand for [`ic_cdk::api::msg_caller`],
/// kept for readability and to align with the concise naming convention
/// used our helpers.
///
/// # Example
/// ```ignore
/// let user = ic::api::caller();
/// ```
#[cfg(target_arch = "wasm32")]
pub fn caller() -> Principal {
    msg_caller()
}

#[cfg(not(target_arch = "wasm32"))]
pub fn caller() -> Principal {
    Principal::from_text("bphsl-fvy2d-emlkg-wuhfe-fylew-25w4a-vpdm3-ajsos-ao4x5-sxn5j-jqe").unwrap()
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
/// ic::api::print("Satellite started successfully");
/// ```
#[cfg(target_arch = "wasm32")]
pub fn print<S: AsRef<str>>(s: S) {
    debug_print(s)
}

#[cfg(not(target_arch = "wasm32"))]
pub fn print<S: AsRef<str>>(_s: S) {
    // Noop
}

/// Returns the current timestamp in nanoseconds since the UNIX epoch.
///
/// This is a shorthand for [`ic_cdk::api::time`] useful for
/// test in wasm32 environment.
///
/// # Example
/// ```ignore
/// let now = ic::api::time();
/// ```
#[cfg(target_arch = "wasm32")]
pub fn time() -> u64 {
    ic_time()
}

#[cfg(not(target_arch = "wasm32"))]
pub fn time() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64
}

#[cfg(target_arch = "wasm32")]
pub fn is_canister_controller(principal: &Principal) -> bool {
    ic_is_controller(principal)
}

#[cfg(not(target_arch = "wasm32"))]
pub fn is_canister_controller(principal: &Principal) -> bool {
    // For tests, return true for specific test principals or implement mock logic
    // This is a simple mock - adjust based on your needs
    *principal == Principal::from_text("ck4tp-3iaaa-aaaal-ab7da-cai").unwrap()
}
