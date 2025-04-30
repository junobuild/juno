use crate::assert::config::{
    assert_page_views_enabled, assert_performance_metrics_enabled, assert_track_events_enabled,
};
use crate::config::store::get_satellite_config;
use crate::events::parsers::parse_page_view_client;
use crate::events::store::{insert_page_view, insert_performance_metric, insert_track_event};
use crate::state::types::state::{AnalyticKey, PageView, PerformanceMetric, TrackEvent};
use crate::types::interface::{SetPageView, SetPerformanceMetric, SetTrackEvent};

pub fn assert_and_insert_page_view(
    key: AnalyticKey,
    page_view: SetPageView,
) -> Result<PageView, String> {
    assert_page_views_enabled(&get_satellite_config(&page_view.satellite_id))?;

    let client = parse_page_view_client(&page_view);

    insert_page_view(key, page_view, &client)
}

pub fn assert_and_insert_track_event(
    key: AnalyticKey,
    track_event: SetTrackEvent,
) -> Result<TrackEvent, String> {
    assert_track_events_enabled(&get_satellite_config(&track_event.satellite_id))?;

    insert_track_event(key, track_event)
}

pub fn assert_and_insert_performance_metric(
    key: AnalyticKey,
    performance_metric: SetPerformanceMetric,
) -> Result<PerformanceMetric, String> {
    assert_performance_metrics_enabled(&get_satellite_config(&performance_metric.satellite_id))?;

    insert_performance_metric(key, performance_metric)
}
