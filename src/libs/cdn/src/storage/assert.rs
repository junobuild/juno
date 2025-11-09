use crate::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_DESCRIPTION,
    JUNO_CDN_STORAGE_ERROR_MISSING_RELEASES_DESCRIPTION,
};
use junobuild_shared::assert::assert_version;
use junobuild_shared::regex::build_regex;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;

pub fn assert_releases_description(description: &Option<String>) -> Result<(), String> {
    let desc = description
        .as_deref()
        .ok_or(JUNO_CDN_STORAGE_ERROR_MISSING_RELEASES_DESCRIPTION)?;

    let desc_re = build_regex(r"^change=\d+;version=[^;]+$")?;
    if !desc_re.is_match(desc) {
        return Err(format!(
            "{JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_DESCRIPTION} ({desc})"
        ));
    }

    Ok(())
}

pub fn assert_set_config(
    proposed_config: &SetStorageConfig,
    current_config: &StorageConfig,
) -> Result<(), String> {
    assert_version(proposed_config.version, current_config.version)?;

    Ok(())
}
