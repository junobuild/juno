use crate::msg::{ERROR_NO_TIMESTAMP, ERROR_TIMESTAMP_OUTDATED_OR_FUTURE};

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
