use crate::analytics::analytics_track_events;
use crate::events::helpers::assert_and_insert_track_event;
use crate::events::store::get_track_events as get_track_events_store;
use crate::guards::caller_is_controller;
use crate::state::types::state::{AnalyticKey, TrackEvent};
use crate::types::interface::{AnalyticsTrackEvents, GetAnalytics, SetTrackEvent};
use ic_cdk_macros::{query, update};

#[update(guard = "caller_is_controller")]
fn set_track_event(key: AnalyticKey, track_event: SetTrackEvent) -> Result<TrackEvent, String> {
    assert_and_insert_track_event(key, track_event)
}

#[update(guard = "caller_is_controller")]
fn set_track_events(
    track_events: Vec<(AnalyticKey, SetTrackEvent)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, track_event: SetTrackEvent) -> Result<(), String> {
        assert_and_insert_track_event(key, track_event)?;

        Ok(())
    }

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for (key, track_event) in track_events {
        let result = insert(key.clone(), track_event);

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key, err)),
        }
    }

    if !errors.is_empty() {
        return Err(errors);
    }

    Ok(())
}

#[query(guard = "caller_is_controller")]
fn get_track_events(filter: GetAnalytics) -> Vec<(AnalyticKey, TrackEvent)> {
    get_track_events_store(&filter)
}

#[query(guard = "caller_is_controller")]
fn get_track_events_analytics(filter: GetAnalytics) -> AnalyticsTrackEvents {
    let track_events = get_track_events_store(&filter);
    analytics_track_events(&track_events)
}
