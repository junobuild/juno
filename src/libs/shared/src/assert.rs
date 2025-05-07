use crate::canister::memory_size;
use crate::msg::{
    JUNO_ERROR_NO_TIMESTAMP, JUNO_ERROR_NO_VERSION, JUNO_ERROR_TIMESTAMP_OUTDATED_OR_FUTURE,
    JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE,
};
use crate::types::config::ConfigMaxMemorySize;
use crate::types::interface::MemorySize;
use crate::types::state::Version;

/// Asserts the validity of a given user timestamp against the current timestamp.
/// e.g. the timestamp of an existing entity persisted in a smart contract.
///
/// This function checks if the provided user timestamp matches the current system timestamp.
/// It is designed to ensure that operations relying on timestamps are executed with current
/// or synchronized timestamps to prevent replay or outdated requests.
///
/// # Parameters
/// - `user_timestamp`: An `Option<u64>` representing the user-provided timestamp. This can be `None`
///   if the user did not provide a timestamp, or `Some(u64)` if a timestamp was provided.
/// - `current_timestamp`: A `u64` representing the current system timestamp. This should be
///   the accurate current time in a format consistent with `user_timestamp`.
///
/// # Returns
/// - `Ok(())` if the `user_timestamp` matches the `current_timestamp`.
/// - `Err(String)` if:
///   - The `user_timestamp` is `None`, indicating no timestamp was provided. The error string
///     will be `ERROR_NO_TIMESTAMP.to_string()`, where `ERROR_NO_TIMESTAMP` is a constant string
///     describing the error.
///   - The `user_timestamp` does not match the `current_timestamp`, indicating either an outdated
///     or a future timestamp. The error string will format to include the error description
///     (from a constant `ERROR_TIMESTAMP_OUTDATED_OR_FUTURE`), the current timestamp, and the
///     provided user timestamp.
///
/// # Examples
/// ```
/// let current_timestamp = 1625097600; // Example timestamp
/// let user_timestamp = Some(1625097600);
/// assert_eq!(assert_timestamp(user_timestamp, current_timestamp), Ok(()));
///
/// let wrong_timestamp = Some(1625097601);
/// assert!(assert_timestamp(wrong_timestamp, current_timestamp).is_err());
///
/// let no_timestamp = None;
/// assert!(assert_timestamp(no_timestamp, current_timestamp).is_err());
/// ```
///
#[deprecated]
pub fn assert_timestamp(user_timestamp: Option<u64>, current_timestamp: u64) -> Result<(), String> {
    match user_timestamp {
        None => {
            return Err(JUNO_ERROR_NO_TIMESTAMP.to_string());
        }
        Some(user_timestamp) => {
            if current_timestamp != user_timestamp {
                return Err(format!(
                    "{} ({} - {})",
                    JUNO_ERROR_TIMESTAMP_OUTDATED_OR_FUTURE, current_timestamp, user_timestamp
                ));
            }
        }
    }

    Ok(())
}

/// Asserts the validity of a given user version against the required version.
/// This function checks if the provided user version matches the current system version.
/// It is designed to ensure that operations relying on version numbers are executed with the
/// correct versions to prevent issues with compatibility or outdated requests.
///
/// # Parameters
/// - `user_version`: An `Option<u64>` representing the user-provided version. This can be `None`
///   if the user did not provide a version, or `Some(u64)` if a version was provided.
/// - `current_version`: An `Option<u64>` representing the required system version. This can be `None`
///   which means no specific version requirement is needed.
///
/// # Returns
/// - `Ok(())` if the `user_version` matches the `current_version` or if no specific `current_version` is provided.
/// - `Err(String)` if:
///   - The `user_version` is `None`, indicating no version was provided. The error string
///     will be `ERROR_NO_VERSION.to_string()`, where `ERROR_NO_VERSION` is a constant string
///     describing the error.
///   - The `user_version` does not match the `current_version`, indicating either an incorrect
///     or incompatible version. The error string will format to include the error description
///     (from a constant `ERROR_VERSION_MISMATCH`), the required version, and the provided user version.
///
/// # Examples
/// ```
/// let current_version = Some(3); // Example version
/// let user_version = Some(3);
/// assert_eq!(assert_version(user_version, current_version), Ok(()));
///
/// let wrong_version = Some(2);
/// assert!(assert_version(wrong_version, current_version).is_err());
///
/// let no_version = None;
/// let no_current_version = None;
/// assert!(assert_version(no_version, no_current_version).is_ok());
/// ```
///
pub fn assert_version(
    user_version: Option<Version>,
    current_version: Option<Version>,
) -> Result<(), String> {
    match current_version {
        None => (),
        Some(current_version) => match user_version {
            None => {
                return Err(JUNO_ERROR_NO_VERSION.to_string());
            }
            Some(user_version) => {
                if current_version != user_version {
                    return Err(format!(
                        "{} ({} - {})",
                        JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE, current_version, user_version
                    ));
                }
            }
        },
    }

    Ok(())
}

/// Validates the length of a description field in entities such as documents or assets.
///
/// Ensures that the description does not exceed 1024 characters. If the description exceeds
/// this limit, the function returns an error message.
///
/// # Parameters
///
/// - `description`: An optional reference to a `String` that represents the description field
///   of an entity. If the description is `None`, the function considers it valid and does not
///   perform any length checks.
///
/// # Returns
///
/// - `Ok(())`: If the description is valid (either `None` or within the length limit).
/// - `Err(String)`: If the description exceeds 1024 characters, containing an error message.
///
/// # Examples
///
/// ```
/// let valid_description = Some(String::from("This is a valid description."));
/// assert_eq!(assert_description_length(&valid_description), Ok(()));
///
/// let invalid_description = Some(String::from("a".repeat(1025)));
/// assert_eq!(
///     assert_description_length(&invalid_description),
///     Err(String::from("Description field should not contains more than 1024 characters."))
/// );
///
/// let none_description: Option<String> = None;
/// assert_eq!(assert_description_length(&none_description), Ok(()));
/// ```
pub fn assert_description_length(description: &Option<String>) -> Result<(), String> {
    match description {
        None => (),
        Some(description) => {
            if description.len() > 1024 {
                return Err(
                    "Description field should not contains more than 1024 characters.".to_string(),
                );
            }
        }
    }

    Ok(())
}

pub fn assert_max_memory_size(
    config_max_memory_size: &Option<ConfigMaxMemorySize>,
) -> Result<(), String> {
    if let Some(max_memory_size) = &config_max_memory_size {
        let MemorySize { heap, stable } = memory_size();

        if let Some(max_heap) = max_memory_size.heap {
            if heap > max_heap as u64 {
                return Err(format!(
                    "Heap memory usage exceeded: {} bytes used, {} bytes allowed.",
                    heap, max_heap
                ));
            }
        }

        if let Some(max_stable) = max_memory_size.stable {
            if stable > max_stable as u64 {
                return Err(format!(
                    "Stable memory usage exceeded: {} bytes used, {} bytes allowed.",
                    stable, max_stable
                ));
            }
        }
    }

    Ok(())
}
