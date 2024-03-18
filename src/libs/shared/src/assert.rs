use crate::msg::{ERROR_NO_TIMESTAMP, ERROR_TIMESTAMP_OUTDATED_OR_FUTURE};

/// Asserts the validity of a given user timestamp against the current timestamp.
/// e.g. the timestamp of an existing entity persisted in a smart contract.
///
/// This function checks if the provided user timestamp matches the current system timestamp.
/// It is designed to ensure that operations relying on timestamps are executed with current
/// or synchronized timestamps to prevent replay or outdated requests.
///
/// # Parameters
/// - `user_timestamp`: An `Option<u64>` representing the user-provided timestamp. This can be `None`
/// if the user did not provide a timestamp, or `Some(u64)` if a timestamp was provided.
/// - `current_timestamp`: A `u64` representing the current system timestamp. This should be
/// the accurate current time in a format consistent with `user_timestamp`.
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
pub fn assert_timestamp(user_timestamp: Option<u64>, current_timestamp: u64) -> Result<(), String> {
    match user_timestamp {
        None => {
            return Err(ERROR_NO_TIMESTAMP.to_string());
        }
        Some(user_timestamp) => {
            if current_timestamp != user_timestamp {
                return Err(format!(
                    "{} ({} - {})",
                    ERROR_TIMESTAMP_OUTDATED_OR_FUTURE, current_timestamp, user_timestamp
                ));
            }
        }
    }

    Ok(())
}
