use crate::msg::{
    ERROR_PAGE_VIEWS_FEATURE_DISABLED, ERROR_PERFORMANCE_METRICS_FEATURE_DISABLED,
    ERROR_TRACK_EVENTS_FEATURE_DISABLED,
};
use crate::types::state::SatelliteConfig;

fn assert_feature_enabled<F>(
    config: &Option<SatelliteConfig>,
    check_feature: F,
    error_message: &str,
) -> Result<(), String>
where
    F: Fn(&SatelliteConfig) -> bool,
{
    if let Some(config) = config {
        if check_feature(config) {
            return Ok(());
        }
    }
    Err(error_message.to_string())
}
pub fn assert_page_views_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    assert_feature_enabled(
        config,
        |c| c.features.as_ref().is_some_and(|f| f.page_views),
        ERROR_PAGE_VIEWS_FEATURE_DISABLED,
    )
}

pub fn assert_track_events_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    assert_feature_enabled(
        config,
        |c| c.features.as_ref().is_some_and(|f| f.track_events),
        ERROR_TRACK_EVENTS_FEATURE_DISABLED,
    )
}

pub fn assert_performance_metrics_enabled(config: &Option<SatelliteConfig>) -> Result<(), String> {
    assert_feature_enabled(
        config,
        |c| c.features.as_ref().is_some_and(|f| f.performance_metrics),
        ERROR_PERFORMANCE_METRICS_FEATURE_DISABLED,
    )
}
