use crate::access_keys::store::get_access_keys;
use crate::errors::auth::{
    JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER, JUNO_AUTH_ERROR_NOT_CONTROLLER,
    JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER,
};
use junobuild_shared::ic::api::caller;
use junobuild_shared::segments::access_keys::{
    check_caller_can_write, is_admin_controller, is_caller_valid_access_key,
};
use junobuild_shared::types::state::AccessKeys;

/// Guard that succeeds if the caller is an admin access key of this satellite.
///
/// Admin access keys have full management privileges, including configuring
/// the satellite and managing other access keys. Unlike other access keys,
/// admin access keys never expire.
///
/// Admin access keys are also controllers of the canister as defined by the Internet Computer.
///
/// # Note
/// When called from a serverless functions hook, the caller is the satellite itself,
/// not the original message sender.
///
/// # Errors
/// Returns an error string if the caller is not an admin access key.
pub fn caller_is_admin() -> Result<(), String> {
    let caller = caller();
    let controllers: AccessKeys = get_access_keys();

    if is_admin_controller(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER.to_string())
    }
}

/// Guard that succeeds if the caller is an access key with write permission.
///
/// Grants access to admin and editor access keys. Submitter access keys
/// do not satisfy this guard. Non-admin access keys must not be expired.
///
/// # Note
/// When called from a serverless functions hook, the caller is the satellite itself,
/// not the original message sender.
///
/// # Errors
/// Returns an error string if the caller does not have write permission.
pub fn caller_has_write_permission() -> Result<(), String> {
    let caller = caller();
    let controllers: AccessKeys = get_access_keys();

    if check_caller_can_write(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER.to_string())
    }
}

/// Guard that succeeds if the caller is any recognized access key of this satellite.
///
/// This is the least restrictive access check — it accepts admin, editor,
/// and submitter access keys alike. Non-admin access keys must not be expired.
///
/// # Note
/// When called from a serverless functions hook, the caller is the satellite itself,
/// not the original message sender.
///
/// # Errors
/// Returns an error string if the caller is not a recognized access key.
pub fn caller_is_access_key() -> Result<(), String> {
    let caller = caller();
    let controllers: AccessKeys = get_access_keys();

    if is_caller_valid_access_key(caller, &controllers) {
        Ok(())
    } else {
        Err(JUNO_AUTH_ERROR_NOT_CONTROLLER.to_string())
    }
}
