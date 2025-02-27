use crate::logs::types::logs::{Log, LogLevel};
use crate::random::runtime::random;
use crate::{set_doc_store, Key, SetDoc};
use ic_cdk::api::time;
use ic_cdk::id;
use junobuild_collections::constants::db::COLLECTION_LOG_KEY;
use junobuild_utils::encode_doc_data;
use serde::Serialize;

/// Logs a message at the `Info` level.
///
/// # Arguments
///
/// * `message` - A string slice that holds the message to be logged.
///
/// # Returns
///
/// A result indicating success (`Ok(())`) or containing an error message (`Err(String)`).
pub fn log(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Info, message, None)
}

/// Logs a message at the `Info` level with additional serialized data.
///
/// # Arguments
///
/// * `message` - The message to be logged.
/// * `data` - A reference to the data to be logged. The data must implement the `Serialize` trait.
///
/// # Returns
///
/// A result indicating success or containing an error message.
pub fn log_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Info, message, Some(data))
}

/// Logs an informational message.
///
/// This function is a convenience wrapper for `log`, setting the log level to `Info`.
pub fn info(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Info, message, None)
}

/// Logs an informational message with additional serialized data.
pub fn info_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Info, message, Some(data))
}

/// Logs a debug-level message.
pub fn debug(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Debug, message, None)
}

/// Logs a debug-level message with additional serialized data.
pub fn debug_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Debug, message, Some(data))
}

/// Logs a warning message.
pub fn warn(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Warning, message, None)
}

/// Logs a warning message with additional serialized data.
pub fn warn_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Warning, message, Some(data))
}

/// Logs an error message.
pub fn error(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Error, message, None)
}

/// Logs an error message with additional serialized data.
pub fn error_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Error, message, Some(data))
}

fn set_log<T: Serialize>(level: LogLevel, message: String, data: Option<&T>) -> Result<(), String> {
    let nonce = random()?;

    let key: Key = format!("{}-{}", time(), nonce);

    let log_data = data.map(encode_doc_data).transpose()?;

    let log: Log = Log {
        level,
        message,
        data: log_data,
    };

    let doc: SetDoc = SetDoc {
        description: None,
        data: encode_doc_data(&log)?,
        version: None,
    };

    set_doc_store(id(), COLLECTION_LOG_KEY.to_string(), key, doc)?;

    Ok(())
}
