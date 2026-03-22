use crate::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use crate::errors::JUNO_STORAGE_ERROR_RESERVED_ASSET;
use crate::types::state::FullPath;

pub fn assert_not_well_known_asset(full_path: &FullPath) -> Result<(), String> {
    // /.well-known/ic-domains is automatically generated for custom domains
    assert_not_reserved_path(full_path, WELL_KNOWN_CUSTOM_DOMAINS)?;

    // /.well-known/ii-alternative-origins is automatically generated for alternative origins
    assert_not_reserved_path(full_path, WELL_KNOWN_II_ALTERNATIVE_ORIGINS)?;

    Ok(())
}

fn assert_not_reserved_path(full_path: &str, reserved_path: &str) -> Result<(), String> {
    if full_path == reserved_path {
        return Err(format!(
            "{JUNO_STORAGE_ERROR_RESERVED_ASSET} ({reserved_path})"
        ));
    }
    Ok(())
}
