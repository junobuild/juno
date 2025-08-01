use crate::assert::constraints::{
    assert_analytic_key_length, assert_page_view_campaign_length, assert_page_view_length,
    assert_satellite_id, assert_session_id, assert_track_event_length,
};
use crate::events::filters::{filter_analytics, filter_satellites_analytics};
use crate::state::memory::manager::STATE;
use crate::state::types::memory::{StoredPageView, StoredTrackEvent};
use crate::state::types::state::{
    AnalyticKey, AnalyticSatelliteKey, PageView, PerformanceMetric, StableState, TrackEvent,
};
use crate::types::interface::{GetAnalytics, SetPageView, SetPerformanceMetric, SetTrackEvent};
use ic_cdk::api::time;
use junobuild_shared::assert::{assert_timestamp, assert_version};
use junobuild_shared::structures::collect_stable_vec;
use junobuild_shared::types::state::Timestamp;
use junobuild_shared::version::next_version;

pub fn insert_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    STATE.with(|state| insert_page_view_impl(key, page_view, &mut state.borrow_mut().stable))
}

fn insert_page_view_impl(
    key: AnalyticKey,
    page_view: SetPageView,
    state: &mut StableState,
) -> Result<PageView, String> {
    assert_analytic_key_length(&key)?;
    assert_page_view_length(&page_view)?;
    assert_page_view_campaign_length(&page_view)?;

    let current_page_view = state.page_views.get(&key);

    // Validate overwrite
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            if current_page_view.is_bounded() {
                match assert_timestamp(
                    page_view.updated_at,
                    current_page_view.into_inner().updated_at,
                ) {
                    Ok(_) => (),
                    Err(e) => {
                        return Err(e);
                    }
                }
            } else {
                match assert_version(page_view.version, current_page_view.into_inner().version) {
                    Ok(_) => (),
                    Err(e) => {
                        return Err(e);
                    }
                }
            }
        }
    }

    // Validate session id
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            assert_session_id(
                &page_view.session_id,
                &current_page_view.into_inner().session_id,
            )?;
        }
    }

    // Validate satellite id
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            assert_satellite_id(
                page_view.satellite_id,
                current_page_view.into_inner().satellite_id,
            )?;
        }
    }

    let now = time();

    let created_at: Timestamp = match current_page_view.clone() {
        None => now,
        Some(current_page_view) => current_page_view.into_inner().created_at,
    };

    let version = next_version(&current_page_view);

    let session_id: String = match current_page_view.clone() {
        None => page_view.session_id.clone(),
        Some(current_page_view) => current_page_view.into_inner().session_id.clone(),
    };

    let new_page_view: PageView = PageView {
        title: page_view.title,
        href: page_view.href,
        referrer: page_view.referrer,
        device: page_view.device,
        user_agent: page_view.user_agent,
        client: page_view.client,
        time_zone: page_view.time_zone,
        satellite_id: page_view.satellite_id,
        session_id,
        campaign: page_view.campaign,
        created_at,
        updated_at: now,
        version: Some(version),
    };

    let stored_page_view = match current_page_view.map(|page_view| page_view.is_bounded()) {
        Some(true) => StoredPageView::Bounded(new_page_view.clone()),
        _ => StoredPageView::Unbounded(new_page_view.clone()),
    };

    state.page_views.insert(key.clone(), stored_page_view);

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
    assert_analytic_key_length(&key)?;
    assert_track_event_length(&track_event)?;

    let current_track_event = state.track_events.get(&key);

    // Validate overwrite
    match current_track_event.clone() {
        None => (),
        Some(current_track_event) => {
            if current_track_event.is_bounded() {
                match assert_timestamp(
                    track_event.updated_at,
                    current_track_event.into_inner().updated_at,
                ) {
                    Ok(_) => (),
                    Err(e) => {
                        return Err(e);
                    }
                }
            } else {
                match assert_version(
                    track_event.version,
                    current_track_event.into_inner().version,
                ) {
                    Ok(_) => (),
                    Err(e) => {
                        return Err(e);
                    }
                }
            }
        }
    }

    // Validate session id
    match current_track_event.clone() {
        None => (),
        Some(current_track_event) => {
            assert_session_id(
                &track_event.session_id,
                &current_track_event.into_inner().session_id,
            )?;
        }
    }

    // Validate satellite id
    match current_track_event.clone() {
        None => (),
        Some(current_track_event) => {
            assert_satellite_id(
                track_event.satellite_id,
                current_track_event.into_inner().satellite_id,
            )?;
        }
    }

    let now = time();

    let created_at: Timestamp = match current_track_event.clone() {
        None => now,
        Some(current_track_event) => current_track_event.into_inner().created_at,
    };

    let version = next_version(&current_track_event);

    let session_id: String = match current_track_event.clone() {
        None => track_event.session_id.clone(),
        Some(current_track_event) => current_track_event.into_inner().session_id.clone(),
    };

    let new_track_event: TrackEvent = TrackEvent {
        name: track_event.name,
        metadata: track_event.metadata,
        satellite_id: track_event.satellite_id,
        session_id,
        created_at,
        updated_at: now,
        version: Some(version),
    };

    let stored_track_event = match current_track_event.map(|track_event| track_event.is_bounded()) {
        Some(true) => StoredTrackEvent::Bounded(new_track_event.clone()),
        _ => StoredTrackEvent::Unbounded(new_track_event.clone()),
    };

    state
        .track_events
        .insert(key.clone(), stored_track_event.clone());

    state.satellites_track_events.insert(
        AnalyticSatelliteKey::from_key(&key, &track_event.satellite_id),
        key.clone(),
    );

    Ok(new_track_event.clone())
}

pub fn insert_performance_metric(
    key: AnalyticKey,
    performance_metric: SetPerformanceMetric,
) -> Result<PerformanceMetric, String> {
    STATE.with(|state| {
        insert_performance_metric_impl(key, performance_metric, &mut state.borrow_mut().stable)
    })
}

fn insert_performance_metric_impl(
    key: AnalyticKey,
    performance_metric: SetPerformanceMetric,
    state: &mut StableState,
) -> Result<PerformanceMetric, String> {
    assert_analytic_key_length(&key)?;

    let current_performance_metric = state.performance_metrics.get(&key);

    // Validate overwrite
    match &current_performance_metric {
        None => (),
        Some(current_performance_metric) => {
            match assert_version(
                performance_metric.version,
                current_performance_metric.version,
            ) {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    // Validate session id
    match &current_performance_metric {
        None => (),
        Some(current_performance_metric) => {
            assert_session_id(
                &performance_metric.session_id,
                &current_performance_metric.session_id,
            )?;
        }
    }

    // Validate satellite id
    match &current_performance_metric.clone() {
        None => (),
        Some(current_performance_metric) => {
            assert_satellite_id(
                performance_metric.satellite_id,
                current_performance_metric.satellite_id,
            )?;
        }
    }

    let now = time();

    let created_at: Timestamp = match &current_performance_metric {
        None => now,
        Some(current_performance_metric) => current_performance_metric.created_at,
    };

    let version = next_version(&current_performance_metric);

    let session_id: String = match &current_performance_metric {
        None => performance_metric.session_id.clone(),
        Some(current_performance_metric) => current_performance_metric.session_id.clone(),
    };

    let new_performance_metric: PerformanceMetric = PerformanceMetric {
        href: performance_metric.href,
        metric_name: performance_metric.metric_name,
        data: performance_metric.data,
        satellite_id: performance_metric.satellite_id,
        session_id,
        created_at,
        updated_at: now,
        version: Some(version),
    };

    state
        .performance_metrics
        .insert(key.clone(), new_performance_metric.clone());

    state.satellites_performance_metrics.insert(
        AnalyticSatelliteKey::from_key(&key, &new_performance_metric.satellite_id),
        key.clone(),
    );

    Ok(new_performance_metric.clone())
}

pub fn get_page_views(filter: &GetAnalytics) -> Vec<(AnalyticKey, PageView)> {
    STATE.with(|state| get_page_views_impl(filter, &state.borrow_mut().stable))
}

fn get_page_views_impl(filter: &GetAnalytics, state: &StableState) -> Vec<(AnalyticKey, PageView)> {
    match filter.satellite_id {
        None => state
            .page_views
            .range(filter_analytics(filter))
            .map(|entry| (entry.key().clone(), entry.value().into_inner().clone()))
            .collect(),
        Some(satellite_id) => {
            let satellites_keys: Vec<(AnalyticSatelliteKey, AnalyticKey)> = collect_stable_vec(
                state
                    .satellites_page_views
                    .range(filter_satellites_analytics(filter, satellite_id)),
            );
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let page_view = state.page_views.get(key);
                    page_view.map(|page_view| (key.clone(), page_view.into_inner()))
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
        None => state
            .track_events
            .range(filter_analytics(filter))
            .map(|entry| (entry.key().clone(), entry.value().into_inner().clone()))
            .collect(),
        Some(satellite_id) => {
            let satellites_keys: Vec<(AnalyticSatelliteKey, AnalyticKey)> = collect_stable_vec(
                state
                    .satellites_track_events
                    .range(filter_satellites_analytics(filter, satellite_id)),
            );
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let track_event = state.track_events.get(key);
                    track_event.map(|track_event| (key.clone(), track_event.into_inner()))
                })
                .collect()
        }
    }
}

pub fn get_performance_metrics(filter: &GetAnalytics) -> Vec<(AnalyticKey, PerformanceMetric)> {
    STATE.with(|state| get_performance_metrics_impl(filter, &state.borrow_mut().stable))
}

fn get_performance_metrics_impl(
    filter: &GetAnalytics,
    state: &StableState,
) -> Vec<(AnalyticKey, PerformanceMetric)> {
    match filter.satellite_id {
        None => collect_stable_vec(state.performance_metrics.range(filter_analytics(filter))),
        Some(satellite_id) => {
            let satellites_keys: Vec<(AnalyticSatelliteKey, AnalyticKey)> = collect_stable_vec(
                state
                    .satellites_performance_metrics
                    .range(filter_satellites_analytics(filter, satellite_id)),
            );
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let performance_metric = state.performance_metrics.get(key);
                    performance_metric.map(|performance_metric| (key.clone(), performance_metric))
                })
                .collect()
        }
    }
}
