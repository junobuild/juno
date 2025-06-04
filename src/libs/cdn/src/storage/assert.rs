use crate::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_DESCRIPTION,
    JUNO_CDN_STORAGE_ERROR_MISSING_RELEASES_DESCRIPTION,
};
use junobuild_shared::regex::build_regex;

pub fn assert_releases_description(description: &Option<String>) -> Result<(), String> {
    let desc = description
        .as_deref()
        .ok_or_else(|| JUNO_CDN_STORAGE_ERROR_MISSING_RELEASES_DESCRIPTION)?;

    let desc_re = build_regex(r"^change=\d+;version=[^;]+$")?;
    if !desc_re.is_match(&desc) {
        return Err(format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_DESCRIPTION, desc
        ));
    }

    Ok(())
}
