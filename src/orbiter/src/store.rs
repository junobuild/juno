use crate::assert::{
    assert_analytic_key_length, assert_bot, assert_page_view_length, assert_track_event_length,
};
use crate::memory::STATE;
use crate::types::interface::{GetAnalytics, SetPageView, SetTrackEvent};
use crate::types::state::{AnalyticKey, PageView, PageViewsStable, TrackEvent, TrackEventsStable};
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::utils::principal_equal;

pub fn insert_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    STATE.with(|state| {
        insert_page_view_impl(key, page_view, &mut state.borrow_mut().stable.page_views)
    })
}

fn insert_page_view_impl(
    key: AnalyticKey,
    page_view: SetPageView,
    db: &mut PageViewsStable,
) -> Result<PageView, String> {
    assert_bot(&page_view.user_agent)?;
    assert_analytic_key_length(&key)?;
    assert_page_view_length(&page_view)?;

    let current_page_view = db.get(&key);

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

    let now = time();

    let created_at: u64 = match current_page_view {
        None => now,
        Some(current_page_view) => current_page_view.created_at,
    };

    let new_page_view: PageView = PageView {
        title: page_view.title,
        href: page_view.href,
        referrer: page_view.referrer,
        device: page_view.device,
        user_agent: page_view.user_agent,
        time_zone: page_view.time_zone,
        collected_at: page_view.collected_at,
        created_at,
        updated_at: now,
    };

    db.insert(key.clone(), new_page_view.clone());

    Ok(new_page_view.clone())
}

pub fn insert_track_event(
    key: AnalyticKey,
    track_event: SetTrackEvent,
) -> Result<TrackEvent, String> {
    STATE.with(|state| {
        insert_track_event_impl(
            key,
            track_event,
            &mut state.borrow_mut().stable.track_events,
        )
    })
}

fn insert_track_event_impl(
    key: AnalyticKey,
    track_event: SetTrackEvent,
    db: &mut TrackEventsStable,
) -> Result<TrackEvent, String> {
    assert_bot(&track_event.user_agent)?;
    assert_analytic_key_length(&key)?;
    assert_track_event_length(&track_event)?;

    let current_track_event = db.get(&key);

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

    // There is no timestamp assertion in the case of the Orbiter analytics.
    // It's possible that the user refreshes the browser quickly, and as a result, the JS worker may send the same page again.
    // To improve performance, we want to avoid forcing the worker to fetch entities again in such cases.

    let now = time();

    let created_at: u64 = match current_track_event {
        None => now,
        Some(current_track_event) => current_track_event.created_at,
    };

    let new_track_event: TrackEvent = TrackEvent {
        name: track_event.name,
        metadata: track_event.metadata,
        collected_at: track_event.collected_at,
        created_at,
        updated_at: now,
    };

    db.insert(key.clone(), new_track_event.clone());

    Ok(new_track_event.clone())
}

pub fn get_page_views(filter: &GetAnalytics) -> Vec<(AnalyticKey, PageView)> {
    STATE.with(|state| get_page_views_impl(filter, &state.borrow_mut().stable.page_views))
}

fn get_page_views_impl(
    filter: &GetAnalytics,
    db: &PageViewsStable,
) -> Vec<(AnalyticKey, PageView)> {
    db.iter()
        .filter(|(key, page_view)| filter_analytics(filter, key, page_view.collected_at))
        .collect()
}

pub fn get_track_events(filter: &GetAnalytics) -> Vec<(AnalyticKey, TrackEvent)> {
    STATE.with(|state| get_track_events_impl(filter, &state.borrow_mut().stable.track_events))
}

fn get_track_events_impl(
    filter: &GetAnalytics,
    db: &TrackEventsStable,
) -> Vec<(AnalyticKey, TrackEvent)> {
    db.iter()
        .filter(|(key, track_event)| filter_analytics(filter, key, track_event.collected_at))
        .collect()
}

fn filter_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id,
    }: &GetAnalytics,
    key: &AnalyticKey,
    collected_at: u64,
) -> bool {
    let valid_key = match satellite_id {
        None => true,
        Some(satellite_id) => principal_equal(key.satellite_id, *satellite_id),
    };

    let valid_from = match from {
        None => true,
        Some(from) => collected_at >= *from,
    };

    let valid_to = match to {
        None => true,
        Some(to) => collected_at <= *to,
    };

    valid_key && valid_from && valid_to
}
