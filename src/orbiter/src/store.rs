use crate::assert::{
    assert_analytic_key_length, assert_bot, assert_page_view_length, assert_satellite_id,
    assert_session_id, assert_track_event_length,
};
use crate::filters::{filter_analytics, filter_satellites_analytics};
use crate::memory::STATE;
use crate::types::interface::{GetAnalytics, SetPageView, SetTrackEvent};
use crate::types::state::{AnalyticKey, AnalyticSatelliteKey, PageView, StableState, TrackEvent};
use ic_cdk::api::time;
use shared::assert::assert_timestamp;

pub fn insert_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    STATE.with(|state| insert_page_view_impl(key, page_view, &mut state.borrow_mut().stable))
}

fn insert_page_view_impl(
    key: AnalyticKey,
    page_view: SetPageView,
    state: &mut StableState,
) -> Result<PageView, String> {
    assert_bot(&page_view.user_agent)?;
    assert_analytic_key_length(&key)?;
    assert_page_view_length(&page_view)?;

    let current_page_view = state.page_views.get(&key);

    // Validate timestamp
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            match assert_timestamp(page_view.updated_at, current_page_view.updated_at) {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    // Validate session id
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            assert_session_id(&page_view.session_id, &current_page_view.session_id)?;
        }
    }

    // Validate satellite id
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            assert_satellite_id(page_view.satellite_id, current_page_view.satellite_id)?;
        }
    }

    let now = time();

    let created_at: u64 = match current_page_view.clone() {
        None => now,
        Some(current_page_view) => current_page_view.created_at,
    };

    let session_id: String = match current_page_view.clone() {
        None => page_view.session_id.clone(),
        Some(current_page_view) => current_page_view.session_id,
    };

    let new_page_view: PageView = PageView {
        title: page_view.title,
        href: page_view.href,
        referrer: page_view.referrer,
        device: page_view.device,
        user_agent: page_view.user_agent,
        time_zone: page_view.time_zone,
        satellite_id: page_view.satellite_id,
        session_id,
        created_at,
        updated_at: now,
    };

    state.page_views.insert(key.clone(), new_page_view.clone());

    state.satellites_page_views.insert(
        AnalyticSatelliteKey::from_key(&key, &page_view.satellite_id),
        key.clone(),
    );

    Ok(new_page_view.clone())
}

pub fn insert_track_event(
    key: AnalyticKey,
    track_event: SetTrackEvent,
) -> Result<TrackEvent, String> {
    STATE.with(|state| insert_track_event_impl(key, track_event, &mut state.borrow_mut().stable))
}

fn insert_track_event_impl(
    key: AnalyticKey,
    track_event: SetTrackEvent,
    state: &mut StableState,
) -> Result<TrackEvent, String> {
    assert_bot(&track_event.user_agent)?;
    assert_analytic_key_length(&key)?;
    assert_track_event_length(&track_event)?;

    let current_track_event = state.track_events.get(&key);

    // Validate timestamp
    match current_track_event.clone() {
        None => (),
        Some(current_track_event) => {
            match assert_timestamp(track_event.updated_at, current_track_event.updated_at) {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    // Validate session id
    match current_track_event.clone() {
        None => (),
        Some(current_track_event) => {
            assert_session_id(&track_event.session_id, &current_track_event.session_id)?;
        }
    }

    // Validate satellite id
    match current_track_event.clone() {
        None => (),
        Some(current_track_event) => {
            assert_satellite_id(track_event.satellite_id, current_track_event.satellite_id)?;
        }
    }

    // There is no timestamp assertion in the case of the Orbiter analytics.
    // It's possible that the user refreshes the browser quickly, and as a result, the JS worker may send the same page again.
    // To improve performance, we want to avoid forcing the worker to fetch entities again in such cases.

    let now = time();

    let created_at: u64 = match current_track_event.clone() {
        None => now,
        Some(current_track_event) => current_track_event.created_at,
    };

    let session_id: String = match current_track_event.clone() {
        None => track_event.session_id.clone(),
        Some(current_track_event) => current_track_event.session_id,
    };

    let new_track_event: TrackEvent = TrackEvent {
        name: track_event.name,
        metadata: track_event.metadata,
        satellite_id: track_event.satellite_id,
        session_id,
        created_at,
        updated_at: now,
    };

    state
        .track_events
        .insert(key.clone(), new_track_event.clone());

    state.satellites_track_events.insert(
        AnalyticSatelliteKey::from_key(&key, &track_event.satellite_id),
        key.clone(),
    );

    Ok(new_track_event.clone())
}

pub fn get_page_views(filter: &GetAnalytics) -> Vec<(AnalyticKey, PageView)> {
    STATE.with(|state| get_page_views_impl(filter, &state.borrow_mut().stable))
}

fn get_page_views_impl(filter: &GetAnalytics, state: &StableState) -> Vec<(AnalyticKey, PageView)> {
    match filter.satellite_id {
        None => state.page_views.range(filter_analytics(filter)).collect(),
        Some(satellite_id) => {
            let satellites_keys: Vec<(AnalyticSatelliteKey, AnalyticKey)> = state
                .satellites_page_views
                .range(filter_satellites_analytics(filter, satellite_id))
                .collect();
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let page_view = state.page_views.get(key);
                    page_view.map(|page_view| (key.clone(), page_view))
                })
                .collect()
        }
    }
}

pub fn get_track_events(filter: &GetAnalytics) -> Vec<(AnalyticKey, TrackEvent)> {
    STATE.with(|state| get_track_events_impl(filter, &state.borrow_mut().stable))
}

fn get_track_events_impl(
    filter: &GetAnalytics,
    state: &StableState,
) -> Vec<(AnalyticKey, TrackEvent)> {
    match filter.satellite_id {
        None => state.track_events.range(filter_analytics(filter)).collect(),
        Some(satellite_id) => {
            let satellites_keys: Vec<(AnalyticSatelliteKey, AnalyticKey)> = state
                .satellites_track_events
                .range(filter_satellites_analytics(filter, satellite_id))
                .collect();
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let track_event = state.track_events.get(key);
                    track_event.map(|track_event| (key.clone(), track_event))
                })
                .collect()
        }
    }
}
