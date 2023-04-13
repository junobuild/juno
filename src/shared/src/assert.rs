pub fn assert_timestamp(user_timestamp: Option<u64>, current_timestamp: u64) -> Result<(), String> {
    match user_timestamp {
        None => {
            return Err("No timestamp provided.".to_string());
        }
        Some(user_timestamp) => {
            if current_timestamp != user_timestamp {
                return Err(format!(
                    "Timestamp is outdated or in the future ({} - {})",
                    current_timestamp, user_timestamp
                ));
            }
        }
    }

    Ok(())
}
