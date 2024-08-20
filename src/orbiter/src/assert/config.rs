use crate::msg::ERROR_FEATURE_NOT_ENABLED;
use crate::types::state::SatelliteConfig;

pub fn assert_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    // Enabling the analytics for a satellite is an opt-in feature
    match config {
        None => {}
        Some(config) => {
            if config.enabled {
                return Ok(());
            }
        }
    }

    Err(ERROR_FEATURE_NOT_ENABLED.to_string())
}
