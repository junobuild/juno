use crate::msg::{
    ERROR_PAGE_VIEWS_FEATURE_DISABLED, ERROR_PERFORMANCE_FEATURE_DISABLED,
    ERROR_TRACK_EVENTS_FEATURE_DISABLED,
};
use crate::types::state::SatelliteConfig;

pub fn assert_page_views_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    if let Some(config) = config {
        match &config.features {
            Some(features) => {
                if features.page_views {
                    return Ok(());
                }
            }
            None => (),
        }

        // Fallback on previous configuration
        if config.enabled {
            return Ok(());
        }
    }

    Err(ERROR_PAGE_VIEWS_FEATURE_DISABLED.to_string())
}

pub fn assert_track_events_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    if let Some(config) = config {
        match &config.features {
            Some(features) => {
                if features.track_events {
                    return Ok(());
                }
            }
            None => (),
        }

        // Fallback on previous configuration
        if config.enabled {
            return Ok(());
        }
    }

    Err(ERROR_TRACK_EVENTS_FEATURE_DISABLED.to_string())
}

pub fn assert_performance_metrics_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    if let Some(config) = config {
        match &config.features {
            Some(features) => {
                if features.performance_metrics {
                    return Ok(());
                }
            }
            None => (),
        }

        // Fallback on previous configuration
        if config.enabled {
            return Ok(());
        }
    }

    Err(ERROR_PERFORMANCE_FEATURE_DISABLED.to_string())
}
