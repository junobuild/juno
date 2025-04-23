use crate::assert::config::{assert_page_views_enabled, assert_track_events_enabled};
use crate::events::store::{get_satellite_config, insert_page_view, insert_track_event};
use crate::state::types::state::{AnalyticKey, PageView, TrackEvent};
use crate::types::interface::{SetPageView, SetTrackEvent};

pub fn assert_and_insert_page_view(
    key: AnalyticKey,
    page_view: SetPageView,
) -> Result<PageView, String> {
    assert_page_views_enabled(&get_satellite_config(&page_view.satellite_id))?;

    insert_page_view(key, page_view)
}

pub fn assert_and_insert_track_event(
    key: AnalyticKey,
    track_event: SetTrackEvent,
) -> Result<TrackEvent, String> {
    assert_track_events_enabled(&get_satellite_config(&track_event.satellite_id))?;

    insert_track_event(key, track_event)
}
