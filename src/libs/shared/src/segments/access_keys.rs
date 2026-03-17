use crate::constants::internal::REVOKED_CONTROLLERS;
use crate::constants::shared::{MAX_NUMBER_OF_ACCESS_KEYS, MAX_NUMBER_OF_ADMIN_CONTROLLERS};
use crate::env::{CONSOLE, OBSERVATORY};
use crate::errors::{
    JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY, JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
    JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST, JUNO_ERROR_CONTROLLERS_MAX_NUMBER,
    JUNO_ERROR_CONTROLLERS_REVOKED_NOT_ALLOWED,
};
use crate::ic::api::{id, is_canister_controller, time};
use crate::types::interface::SetController;
use crate::types::state::{AccessKey, AccessKeyId, AccessKeyScope, AccessKeys, UserId};
use crate::utils::{principal_anonymous, principal_equal, principal_not_anonymous};
use candid::Principal;
use std::collections::HashMap;

/// Initializes a set of access keys with default administrative scope.
///
/// # Arguments
/// - `new_access_keys`: Slice of `UserId` representing the new access keys to be initialized.
///
/// # Returns
/// A `AccessKeys` collection populated with the specified new access keys.
pub fn init_admin_access_keys(new_access_keys: &[UserId]) -> AccessKeys {
    let mut access_keys: AccessKeys = AccessKeys::new();

    let access_key_data: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
        scope: AccessKeyScope::Admin,
        kind: None,
    };

    set_access_keys(new_access_keys, &access_key_data, &mut access_keys);

    access_keys
}

/// Sets or updates access keys with specified data.
///
/// # Arguments
/// - `new_access_keys`: Slice of `UserId` for the access keys to be set or updated.
/// - `access_key_data`: `SetController` data to apply to the access keys.
/// - `access_keys`: Mutable reference to the current set of access keys to update.
pub fn set_access_keys(
    new_access_keys: &[UserId],
    access_key_data: &SetController,
    access_keys: &mut AccessKeys,
) {
    for access_key_id in new_access_keys {
        let existing_access_key = access_keys.get(access_key_id);

        let now = time();

        let created_at: u64 = match existing_access_key {
            None => now,
            Some(existing_access_key) => existing_access_key.created_at,
        };

        let updated_at: u64 = now;

        let access_key: AccessKey = AccessKey {
            metadata: access_key_data.metadata.clone(),
            created_at,
            updated_at,
            expires_at: access_key_data.expires_at,
            scope: access_key_data.scope.clone(),
            kind: access_key_data.kind.clone(),
        };

        access_keys.insert(*access_key_id, access_key);
    }
}

/// Removes specified access keys from the set.
///
/// # Arguments
/// - `remove_access_keys`: Slice of `UserId` for the access keys to be removed.
/// - `access_keys`: Mutable reference to the current set of access keys to update.
pub fn delete_access_keys(remove_access_keys: &[AccessKeyId], access_keys: &mut AccessKeys) {
    for id in remove_access_keys {
        access_keys.remove(id);
    }
}

/// Checks if a caller is a non-expired access key with admin or write scope (permissions).
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `access_keys`: Reference to the current set of access keys.
///
/// # Returns
/// `true` if the caller is an access key (not anonymous, calling itself or one of the known write or admin access keys), otherwise `false`.
pub fn access_key_can_write(caller: UserId, access_keys: &AccessKeys) -> bool {
    principal_not_anonymous(caller)
        && (caller_is_self(caller)
            || access_keys
                .iter()
                .any(|(&access_key_id, access_key)| match access_key.scope {
                    AccessKeyScope::Submit => false,
                    _ => {
                        principal_equal(access_key_id, caller)
                            && is_access_key_not_expired(access_key)
                    }
                }))
}

/// Checks if a caller is a non-expired access key regardless of scope (admin, write, or submit).
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `access_keys`: Reference to the current set of access keys.
///
/// # Returns
/// `true` if the caller is an access key (not anonymous, calling itself or one of the known controllers), otherwise `false`.
pub fn is_valid_access_key(caller: UserId, access_keys: &AccessKeys) -> bool {
    principal_not_anonymous(caller)
        && (caller_is_self(caller)
            || access_keys.iter().any(|(&access_key_id, access_key)| {
                principal_equal(access_key_id, caller) && is_access_key_not_expired(access_key)
            }))
}

/// Checks if an access key has not expired.
///
/// Admin access keys never expire. Other access keys are considered not expired if:
/// - They have no expiration date set, or
/// - Their expiration date is in the future
///
/// # Arguments
/// - `access_key`: The access key to check
///
/// # Returns
/// `true` if the access key has not expired, `false` otherwise.
fn is_access_key_not_expired(access_key: &AccessKey) -> bool {
    !is_access_key_expired(access_key)
}

/// Checks if an access key has expired.
///
/// Admin access keys never expire (because those are controllers on the Internet computer).
/// Other keys are considered expired if:
/// - They have an expiration date set, and
/// - That expiration date is in the past
///
/// # Arguments
/// - `access_key`: The access key to check
///
/// # Returns
/// `true` if the access key has expired, `false` otherwise.
fn is_access_key_expired(access_key: &AccessKey) -> bool {
    // Admin controller cannot expire
    if matches!(access_key.scope, AccessKeyScope::Admin) {
        return false;
    }

    access_key
        .expires_at
        .is_some_and(|expires_at| expires_at < time())
}

/// Checks if a caller is an admin access key and a controller has known by the Internet Computer.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
/// - `access_keys`: Reference to the current set of access_keys.
///
/// # Returns
/// `true` if the caller is an admin access key and a controller, otherwise `false`.
pub fn is_admin_controller(caller: UserId, access_keys: &AccessKeys) -> bool {
    is_canister_controller(&caller)
        && principal_not_anonymous(caller)
        && access_keys
            .iter()
            .any(|(&access_key_id, access_key)| match access_key.scope {
                AccessKeyScope::Admin => principal_equal(access_key_id, caller),
                _ => false,
            })
}

/// Converts the access keys set into a vector of access key IDs.
///
/// # Arguments
/// - `access_keys`: Reference to the current set of access keys.
///
/// # Returns
/// A vector of `AccessKeyId`.
pub fn into_access_key_ids(access_keys: &AccessKeys) -> Vec<AccessKeyId> {
    access_keys
        .clone()
        .into_keys()
        .collect::<Vec<AccessKeyId>>()
}

/// Asserts that the number of access keys does not exceed the maximum allowed.
///
/// # Arguments
/// - `current_access_keys`: Reference to the current set of access keys.
/// - `access_keys_ids`: Slice of `AccessKeyId` representing the access keys to be added.
/// - `scope`: The scope of the new access key to be added.
/// - `max_access_keys`: Optional custom maximum number of allowed access keys.
///
/// # Returns
/// `Ok(())` if the operation is successful, or `Err(String)` if the maximum is exceeded.
pub fn assert_max_number_of_access_keys(
    current_access_keys: &AccessKeys,
    access_keys_ids: &[AccessKeyId],
    scope: &AccessKeyScope,
    max_access_keys: Option<usize>,
) -> Result<(), String> {
    let filtered_access_keys = filter_access_keys(current_access_keys, scope);

    let max_length = match scope {
        AccessKeyScope::Admin => max_access_keys.unwrap_or(MAX_NUMBER_OF_ADMIN_CONTROLLERS),
        _ => max_access_keys.unwrap_or(MAX_NUMBER_OF_ACCESS_KEYS),
    };

    assert_access_keys_length(&filtered_access_keys, access_keys_ids, max_length)
}

/// Asserts that the number of access keys does not exceed the maximum allowed.
///
/// # Arguments
/// - `current_access_keys`: Reference to the current set of access keys.
/// - `access_keys_ids`: Slice of `AccessKeyId` representing the access key to be added.
/// - `max_access_keys`: Maximum number of allowed access keys.
///
/// # Returns
/// `Ok(())` if the operation is successful, or `Err(String)` if the maximum is exceeded.
fn assert_access_keys_length(
    current_access_keys: &AccessKeys,
    access_keys_ids: &[AccessKeyId],
    max_access_keys: usize,
) -> Result<(), String> {
    let current_access_key_ids = into_access_key_ids(current_access_keys);

    let new_access_key_ids = access_keys_ids.iter().copied().filter(|id| {
        !current_access_key_ids
            .iter()
            .any(|current_id| current_id == id)
    });

    if current_access_key_ids.len() + new_access_key_ids.count() > max_access_keys {
        return Err(format!(
            "{JUNO_ERROR_CONTROLLERS_MAX_NUMBER} ({max_access_keys})"
        ));
    }

    Ok(())
}

/// Asserts that the access key IDs are not anonymous and not revoked.
///
/// # Arguments
/// - `access_keys_ids`: Slice of `AccessKeyId` to validate.
///
/// # Returns
/// `Ok(())` if no anonymous and no revoked IDs are present, or `Err(String)` if any are found.
pub fn assert_controllers(access_keys_ids: &[AccessKeyId]) -> Result<(), String> {
    assert_no_anonymous_access_key(access_keys_ids)?;
    assert_no_revoked_controller(access_keys_ids)?;

    Ok(())
}

/// Asserts that no access key IDs are anonymous.
///
/// # Arguments
/// - `access_keys_ids`: Slice of `AccessKeyId` to validate.
///
/// # Returns
/// `Ok(())` if no anonymous IDs are present, or `Err(String)` if any are found.
fn assert_no_anonymous_access_key(access_keys_ids: &[AccessKeyId]) -> Result<(), String> {
    let has_anonymous = access_keys_ids
        .iter()
        .any(|controller_id| principal_anonymous(*controller_id));

    match has_anonymous {
        true => Err(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED.to_string()),
        false => Ok(()),
    }
}

/// Asserts that no access key IDs are revoked for security reason.
///
/// # Arguments
/// - `access_keys_ids`: Slice of `AccessKeyId` to validate.
///
/// # Returns
/// `Ok(())` if no revoked IDs are present, or `Err(String)` if any are found.
fn assert_no_revoked_controller(access_keys_ids: &[AccessKeyId]) -> Result<(), String> {
    // We treat revoked controllers as anonymous controllers.
    let has_revoked = access_keys_ids.iter().any(controller_revoked);

    match has_revoked {
        true => Err(JUNO_ERROR_CONTROLLERS_REVOKED_NOT_ALLOWED.to_string()),
        false => Ok(()),
    }
}

/// Validates access key expiration settings.
///
/// Ensures that:
/// - Admin access keys do not have an expiration date set
/// - If an expiration is set, it's not in the past
///
/// # Arguments
/// - `access_key`: The access key configuration to validate
///
/// # Returns
/// `Ok(())` if validation passes, or `Err(String)` with error message if validation fails
pub fn assert_access_key_expiration(access_key: &SetController) -> Result<(), String> {
    if matches!(access_key.scope, AccessKeyScope::Admin) && access_key.expires_at.is_some() {
        return Err(JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY.to_string());
    }

    if let Some(expires_at) = access_key.expires_at {
        if expires_at < time() {
            return Err(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST.to_string());
        }
    }

    Ok(())
}

/// Checks if the caller is the console.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
///
/// # Returns
/// `true` if the caller matches the console's principal, otherwise `false`.
pub fn caller_is_console(caller: UserId) -> bool {
    let console = Principal::from_text(CONSOLE).unwrap();

    principal_equal(caller, console)
}

/// Checks if the caller is the observatory.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
///
/// # Returns
/// `true` if the caller matches the observatory's principal, otherwise `false`.
pub fn caller_is_observatory(caller: UserId) -> bool {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    principal_equal(caller, observatory)
}

/// Checks if the caller is the canister itself.
///
/// # Arguments
/// - `caller`: `UserId` of the caller.
///
/// # Returns
/// `true` if the caller is calling itself, if the canister is the caller, otherwise `false`.
pub fn caller_is_self(caller: UserId) -> bool {
    let itself = id();

    principal_equal(caller, itself)
}

/// Filters the set of access keys, returning only those with administrative scope.
///
/// # Arguments
/// - `access_keys`: Reference to the current set of access keys.
///
/// # Returns
/// An `AccessKeys` collection containing only admin access keys.
pub fn filter_admin_access_keys(access_keys: &AccessKeys) -> AccessKeys {
    filter_access_keys(access_keys, &AccessKeyScope::Admin)
}

/// Filters the set of access keys, returning only those matching the provided scope.
///
/// # Arguments
/// - `access_keys`: Reference to the current set of access keys.
/// - `scope`: The expected scope.
///
/// # Returns
/// An `AccessKeys` collection containing only matching access keys.
fn filter_access_keys(controllers: &AccessKeys, scope: &AccessKeyScope) -> AccessKeys {
    #[allow(clippy::match_like_matches_macro)]
    controllers
        .clone()
        .into_iter()
        .filter(|(_, controller)| match scope {
            AccessKeyScope::Write => matches!(controller.scope, AccessKeyScope::Write),
            AccessKeyScope::Admin => matches!(controller.scope, AccessKeyScope::Admin),
            AccessKeyScope::Submit => matches!(controller.scope, AccessKeyScope::Submit),
        })
        .collect()
}

fn controller_revoked(access_key_id: &AccessKeyId) -> bool {
    REVOKED_CONTROLLERS.iter().any(|revoked_controller_id| {
        principal_equal(
            Principal::from_text(revoked_controller_id).unwrap(),
            *access_key_id,
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::state::{AccessKey, AccessKeyKind, AccessKeyScope, AccessKeys};
    use candid::Principal;
    use std::collections::HashMap;

    fn mock_time() -> u64 {
        1_000_000_000_000
    }

    fn test_principal(id: u8) -> Principal {
        Principal::from_slice(&[id])
    }

    fn create_access_key(
        scope: AccessKeyScope,
        expires_at: Option<u64>,
        kind: Option<AccessKeyKind>,
    ) -> AccessKey {
        AccessKey {
            metadata: HashMap::new(),
            created_at: mock_time(),
            updated_at: mock_time(),
            expires_at,
            scope,
            kind,
        }
    }

    #[test]
    fn test_is_access_key_expired_admin_never_expires() {
        let admin = create_access_key(AccessKeyScope::Admin, Some(mock_time() - 1000), None);
        assert!(!is_access_key_expired(&admin));
    }

    #[test]
    fn test_is_access_key_expired_no_expiration() {
        let access_key = create_access_key(AccessKeyScope::Write, None, None);
        assert!(!is_access_key_expired(&access_key));
    }

    #[test]
    fn test_is_access_key_expired_future_expiration() {
        let access_key = create_access_key(AccessKeyScope::Write, Some(time() + 1_000_000), None);
        assert!(!is_access_key_expired(&access_key));
    }

    #[test]
    fn test_is_access_key_not_expired() {
        let admin = create_access_key(AccessKeyScope::Admin, Some(time() - 1000), None);
        assert!(is_access_key_not_expired(&admin));

        let expired = create_access_key(AccessKeyScope::Write, Some(time() - 1), None);
        assert!(!is_access_key_not_expired(&expired));

        let valid = create_access_key(AccessKeyScope::Write, Some(time() + 1000), None);
        assert!(is_access_key_not_expired(&valid));
    }

    #[test]
    fn test_is_access_key_expired_past_expiration() {
        let access_key = create_access_key(AccessKeyScope::Write, Some(mock_time() - 1), None);
        assert!(is_access_key_expired(&access_key));
    }

    #[test]
    fn test_access_key_can_write_anonymous_rejected() {
        let access_keys = AccessKeys::new();
        assert!(!access_key_can_write(Principal::anonymous(), &access_keys));
    }

    #[test]
    fn test_access_key_can_write_self_allowed() {
        let access_keys = AccessKeys::new();
        let self_principal = id();
        assert!(access_key_can_write(self_principal, &access_keys));
    }

    #[test]
    fn test_access_key_can_write_admin_allowed() {
        let mut access_keys = AccessKeys::new();
        let admin_principal = test_principal(1);

        access_keys.insert(
            admin_principal,
            create_access_key(AccessKeyScope::Admin, None, None),
        );

        assert!(access_key_can_write(admin_principal, &access_keys));
    }

    #[test]
    fn test_access_key_can_write_write_scope_allowed() {
        let mut access_keys = AccessKeys::new();
        let write_principal = test_principal(2);

        access_keys.insert(
            write_principal,
            create_access_key(AccessKeyScope::Write, None, None),
        );

        assert!(access_key_can_write(write_principal, &access_keys));
    }

    #[test]
    fn test_access_key_can_write_submit_rejected() {
        let mut access_keys = AccessKeys::new();
        let submit_principal = test_principal(3);

        access_keys.insert(
            submit_principal,
            create_access_key(AccessKeyScope::Submit, None, None),
        );

        assert!(!access_key_can_write(submit_principal, &access_keys));
    }

    #[test]
    fn test_access_key_can_write_expired_rejected() {
        let mut access_keys = AccessKeys::new();
        let expired_principal = test_principal(4);

        access_keys.insert(
            expired_principal,
            create_access_key(AccessKeyScope::Write, Some(mock_time() - 1), None),
        );

        assert!(!access_key_can_write(expired_principal, &access_keys));
    }

    #[test]
    fn test_is_valid_access_key_anonymous_rejected() {
        let access_keys = AccessKeys::new();
        assert!(!is_valid_access_key(Principal::anonymous(), &access_keys));
    }

    #[test]
    fn test_is_valid_access_key_self_allowed() {
        let access_keys = AccessKeys::new();
        let self_principal = id();
        assert!(is_valid_access_key(self_principal, &access_keys));
    }

    #[test]
    fn test_is_valid_access_key_all_scopes_allowed() {
        let mut access_keys = AccessKeys::new();

        let admin = test_principal(1);
        let write = test_principal(2);
        let submit = test_principal(3);

        access_keys.insert(admin, create_access_key(AccessKeyScope::Admin, None, None));
        access_keys.insert(write, create_access_key(AccessKeyScope::Write, None, None));
        access_keys.insert(
            submit,
            create_access_key(AccessKeyScope::Submit, None, None),
        );

        assert!(is_valid_access_key(admin, &access_keys));
        assert!(is_valid_access_key(write, &access_keys));
        assert!(is_valid_access_key(submit, &access_keys));
    }

    #[test]
    fn test_is_valid_access_key_expired_rejected() {
        let mut access_keys = AccessKeys::new();
        let expired_principal = test_principal(4);

        access_keys.insert(
            expired_principal,
            create_access_key(AccessKeyScope::Write, Some(mock_time() - 1), None),
        );

        assert!(!is_valid_access_key(expired_principal, &access_keys));
    }

    #[test]
    fn test_is_valid_access_key_admin_expired_still_valid() {
        let mut access_keys = AccessKeys::new();
        let admin_principal = test_principal(5);

        // Admin with past expiration should still be valid (admins never expire)
        access_keys.insert(
            admin_principal,
            create_access_key(AccessKeyScope::Admin, Some(mock_time() - 1000), None),
        );

        assert!(is_valid_access_key(admin_principal, &access_keys));
    }

    #[test]
    fn test_init_admin_access_keys() {
        let principals = vec![test_principal(1), test_principal(2)];
        let access_keys = init_admin_access_keys(&principals);

        assert_eq!(access_keys.len(), 2);

        for principal in principals {
            let access_key = access_keys.get(&principal).unwrap();
            assert!(matches!(access_key.scope, AccessKeyScope::Admin));
            assert!(access_key.expires_at.is_none());
            assert!(access_key.kind.is_none());
        }
    }

    #[test]
    fn test_set_access_keys_new() {
        let mut access_keys = AccessKeys::new();
        let principals = vec![test_principal(1)];

        let access_key_data = SetController {
            metadata: HashMap::new(),
            expires_at: Some(mock_time() + 1000),
            scope: AccessKeyScope::Write,
            kind: Some(AccessKeyKind::Automation),
        };

        set_access_keys(&principals, &access_key_data, &mut access_keys);

        assert_eq!(access_keys.len(), 1);
        let access_key = access_keys.get(&principals[0]).unwrap();
        assert!(matches!(access_key.scope, AccessKeyScope::Write));
        assert_eq!(access_key.expires_at, Some(mock_time() + 1000));
        assert!(matches!(access_key.kind, Some(AccessKeyKind::Automation)));
    }

    #[test]
    fn test_set_access_keys_update_preserves_created_at() {
        let mut access_keys = AccessKeys::new();
        let principal = test_principal(1);

        // First insert
        let initial_data = SetController {
            metadata: HashMap::new(),
            expires_at: None,
            scope: AccessKeyScope::Write,
            kind: None,
        };
        set_access_keys(&[principal], &initial_data, &mut access_keys);
        let original_created_at = access_keys.get(&principal).unwrap().created_at;

        // Update
        let update_data = SetController {
            metadata: HashMap::new(),
            expires_at: Some(mock_time() + 1000),
            scope: AccessKeyScope::Admin,
            kind: Some(AccessKeyKind::Automation),
        };
        set_access_keys(&[principal], &update_data, &mut access_keys);

        let updated = access_keys.get(&principal).unwrap();
        assert_eq!(updated.created_at, original_created_at);
        assert!(matches!(updated.scope, AccessKeyScope::Admin));
    }

    #[test]
    fn test_delete_access_keys() {
        let mut access_keys = AccessKeys::new();
        let principals = vec![test_principal(1), test_principal(2), test_principal(3)];

        for principal in &principals {
            access_keys.insert(
                *principal,
                create_access_key(AccessKeyScope::Write, None, None),
            );
        }

        delete_access_keys(&principals[0..2], &mut access_keys);

        assert_eq!(access_keys.len(), 1);
        assert!(access_keys.contains_key(&principals[2]));
        assert!(!access_keys.contains_key(&principals[0]));
        assert!(!access_keys.contains_key(&principals[1]));
    }

    #[test]
    fn test_filter_admin_access_keys() {
        let mut access_keys = AccessKeys::new();

        access_keys.insert(
            test_principal(1),
            create_access_key(AccessKeyScope::Admin, None, None),
        );
        access_keys.insert(
            test_principal(2),
            create_access_key(AccessKeyScope::Write, None, None),
        );
        access_keys.insert(
            test_principal(3),
            create_access_key(AccessKeyScope::Admin, None, None),
        );
        access_keys.insert(
            test_principal(4),
            create_access_key(AccessKeyScope::Submit, None, None),
        );

        let admin_only = filter_admin_access_keys(&access_keys);

        assert_eq!(admin_only.len(), 2);
        assert!(admin_only.contains_key(&test_principal(1)));
        assert!(admin_only.contains_key(&test_principal(3)));
    }

    #[test]
    fn test_filter_access_keys_write() {
        let mut access_keys = AccessKeys::new();

        access_keys.insert(
            test_principal(1),
            create_access_key(AccessKeyScope::Admin, None, None),
        );
        access_keys.insert(
            test_principal(2),
            create_access_key(AccessKeyScope::Write, None, None),
        );
        access_keys.insert(
            test_principal(3),
            create_access_key(AccessKeyScope::Write, None, None),
        );

        let write_only = filter_access_keys(&access_keys, &AccessKeyScope::Write);

        assert_eq!(write_only.len(), 2);
        assert!(write_only.contains_key(&test_principal(2)));
        assert!(write_only.contains_key(&test_principal(3)));
    }

    #[test]
    fn test_filter_access_keys_submit() {
        let mut access_keys = AccessKeys::new();

        access_keys.insert(
            test_principal(1),
            create_access_key(AccessKeyScope::Submit, None, None),
        );
        access_keys.insert(
            test_principal(2),
            create_access_key(AccessKeyScope::Write, None, None),
        );

        let submit_only = filter_access_keys(&access_keys, &AccessKeyScope::Submit);

        assert_eq!(submit_only.len(), 1);
        assert!(submit_only.contains_key(&test_principal(1)));
    }

    #[test]
    fn test_is_admin_controller() {
        let mut access_keys = AccessKeys::new();
        let admin_principal = id(); // Self canister in test

        access_keys.insert(
            admin_principal,
            create_access_key(AccessKeyScope::Admin, None, None),
        );

        assert!(is_admin_controller(admin_principal, &access_keys));
    }

    #[test]
    fn test_is_admin_controller_not_canister_access_key() {
        let mut access_keys = AccessKeys::new();
        let not_canister = test_principal(99);

        access_keys.insert(
            not_canister,
            create_access_key(AccessKeyScope::Admin, None, None),
        );

        // Will fail because test_principal(99) is not the canister access_key
        assert!(!is_admin_controller(not_canister, &access_keys));
    }

    #[test]
    fn test_assert_expiration_access_key_admin_with_expiry_rejected() {
        let access_key = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() + 1000),
            scope: AccessKeyScope::Admin,
            kind: None,
        };

        let result = assert_access_key_expiration(&access_key);
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY.to_string()
        );
    }

    #[test]
    fn test_assert_expiration_access_key_admin_without_expiry_allowed() {
        let access_key = SetController {
            metadata: HashMap::new(),
            expires_at: None,
            scope: AccessKeyScope::Admin,
            kind: None,
        };

        let result = assert_access_key_expiration(&access_key);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_expiration_access_key_past_expiry_rejected() {
        let access_key = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() - 1000),
            scope: AccessKeyScope::Write,
            kind: None,
        };

        let result = assert_access_key_expiration(&access_key);
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST.to_string()
        );
    }

    #[test]
    fn test_assert_expiration_access_key_future_expiry_allowed() {
        let access_key = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() + 1000),
            scope: AccessKeyScope::Write,
            kind: None,
        };

        let result = assert_access_key_expiration(&access_key);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_expiration_access_key_no_expiry_allowed() {
        let access_key = SetController {
            metadata: HashMap::new(),
            expires_at: None,
            scope: AccessKeyScope::Write,
            kind: None,
        };

        let result = assert_access_key_expiration(&access_key);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_expiration_access_key_submit_scope_with_future_expiry() {
        let access_key = SetController {
            metadata: HashMap::new(),
            expires_at: Some(time() + 1000),
            scope: AccessKeyScope::Submit,
            kind: None,
        };

        let result = assert_access_key_expiration(&access_key);
        assert!(result.is_ok());
    }

    #[test]
    fn test_assert_max_number_of_access_keys_admin_default() {
        let mut access_keys = AccessKeys::new();

        // Add MAX_NUMBER_OF_ADMIN_CONTROLLERS - 1 admin access_keys
        for i in 0..(MAX_NUMBER_OF_ADMIN_CONTROLLERS - 1) {
            access_keys.insert(
                test_principal(i as u8),
                create_access_key(AccessKeyScope::Admin, None, None),
            );
        }

        // Adding one more should succeed
        let new_access_keys = vec![test_principal(99)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Admin,
            None,
        );
        assert!(result.is_ok());

        // Adding two more should fail
        let new_access_keys = vec![test_principal(98), test_principal(99)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Admin,
            None,
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_assert_max_number_of_access_keys_write_default() {
        let mut access_keys = AccessKeys::new();

        // Add MAX_NUMBER_OF_ACCESS_KEYS - 1 write access_keys
        for i in 0..(MAX_NUMBER_OF_ACCESS_KEYS - 1) {
            access_keys.insert(
                test_principal(i as u8),
                create_access_key(AccessKeyScope::Write, None, None),
            );
        }

        // Adding one more should succeed
        let new_access_keys = vec![test_principal(255)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Write,
            None,
        );
        assert!(result.is_ok());

        // Adding two more should fail
        let new_access_keys = vec![test_principal(254), test_principal(255)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Write,
            None,
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_assert_max_number_of_access_keys_custom_limit() {
        let mut access_keys = AccessKeys::new();

        // Add 2 admin access_keys
        for i in 0..2 {
            access_keys.insert(
                test_principal(i),
                create_access_key(AccessKeyScope::Admin, None, None),
            );
        }

        // With custom limit of 3, adding one more should succeed
        let new_access_keys = vec![test_principal(3)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Admin,
            Some(3),
        );
        assert!(result.is_ok());

        // Adding two more should fail
        let new_access_keys = vec![test_principal(3), test_principal(4)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Admin,
            Some(3),
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_assert_max_number_of_access_keys_filters_by_scope() {
        let mut access_keys = AccessKeys::new();

        // Add admin access_keys
        for i in 0..5 {
            access_keys.insert(
                test_principal(i),
                create_access_key(AccessKeyScope::Admin, None, None),
            );
        }

        // Add write access_keys
        for i in 10..15 {
            access_keys.insert(
                test_principal(i),
                create_access_key(AccessKeyScope::Write, None, None),
            );
        }

        // Adding a write access_key should only count against write limit, not admin
        let new_access_keys = vec![test_principal(20)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Write,
            Some(6), // 5 existing + 1 new = 6, should succeed
        );
        assert!(result.is_ok());

        // Adding an admin access_key should only count against admin limit
        let new_access_keys = vec![test_principal(21)];
        let result = assert_max_number_of_access_keys(
            &access_keys,
            &new_access_keys,
            &AccessKeyScope::Admin,
            Some(6), // 5 existing + 1 new = 6, should succeed
        );
        assert!(result.is_ok());
    }
}
