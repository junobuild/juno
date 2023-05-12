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
