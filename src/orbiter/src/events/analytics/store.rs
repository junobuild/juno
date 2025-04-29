use std::collections::HashSet;
use junobuild_shared::version::next_version;
use crate::events::analytics::filters::{filter_daily_analytics, filter_daily_satellites_analytics, filter_daily_sessions_analytics, filter_daily_sessions_satellites_analytics};
use crate::events::filters::{filter_analytics, filter_satellites_analytics};
use crate::state::memory::STATE;
use crate::state::types::state::{AnalyticKey, AnalyticSatelliteKey, PageView, StableState};
use crate::state::types::state::analytics::{DailyPageViews, DailyAnalyticKey, DailyAnalyticSatelliteKey, DailySessionsAnalyticKey, DailySessionViews, DailySessionsAnalyticSatelliteKey};
use crate::types::interface::GetAnalytics;
// ---------------------------------------------------------
// Read
// ---------------------------------------------------------

pub fn get_daily_page_views(filter: &GetAnalytics) -> Vec<(DailyAnalyticKey, DailyPageViews)> {
    STATE.with(|state| get_daily_page_views_impl(filter, &state.borrow_mut().stable))
}

fn get_daily_page_views_impl(filter: &GetAnalytics, state: &StableState) -> Vec<(DailyAnalyticKey, DailyPageViews)> {
    match filter.satellite_id {
        None => state
            .daily_page_views
            .range(filter_daily_analytics(filter))
            .map(|(key, daily_page_view)| (key, daily_page_view))
            .collect(),
        Some(satellite_id) => {
            let satellites_keys: Vec<(DailyAnalyticSatelliteKey, DailyAnalyticKey)> = state
                .satellites_daily_page_views
                .range(filter_daily_satellites_analytics(filter, satellite_id))
                .collect();
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let daily_page_view = state.daily_page_views.get(key);
                    daily_page_view.map(|daily_page_view| (key.clone(), daily_page_view))
                })
                .collect()
        }
    }
}

pub fn get_daily_sessions(filter: &GetAnalytics) -> Vec<(DailySessionsAnalyticKey, DailySessionViews)> {
    STATE.with(|state| get_daily_sessions_impl(filter, &state.borrow_mut().stable))
}

fn get_daily_sessions_impl(filter: &GetAnalytics, state: &StableState) -> Vec<(DailySessionsAnalyticKey, DailySessionViews)> {
    match filter.satellite_id {
        None => state
            .daily_session_views
            .range(filter_daily_sessions_analytics(filter))
            .map(|(key, daily_session)| (key, daily_session))
            .collect(),
        Some(satellite_id) => {
            let satellites_keys: Vec<(DailySessionsAnalyticSatelliteKey, DailySessionsAnalyticKey)> = state
                .satellites_daily_session_views
                .range(filter_daily_sessions_satellites_analytics(filter, satellite_id))
                .collect();
            satellites_keys
                .iter()
                .filter_map(|(_, key)| {
                    let daily_session_views = state.daily_session_views.get(key);
                    daily_session_views.map(|daily_session_view| (key.clone(), daily_session_view))
                })
                .collect()
        }
    }
}

// ---------------------------------------------------------
// Save
// ---------------------------------------------------------

pub fn increment_daily_page_views(daily_key: &DailyAnalyticKey, page_view: &PageView) -> Result<(), String> {
    STATE.with(|state| increment_daily_page_view_analytics_impl(daily_key, page_view, &mut state.borrow_mut().stable))
}

pub fn increment_daily_session_views(daily_session_key: &DailySessionsAnalyticKey, page_view: &PageView) -> Result<(), String> {
    STATE.with(|state| increment_daily_session_view_analytics_impl(daily_session_key, page_view, &mut state.borrow_mut().stable))
}

fn increment_daily_page_view_analytics_impl(
    daily_key: &DailyAnalyticKey, page_view: &PageView,
    state: &mut StableState,
) -> Result<(), String> {
    let current_daily_total_page_views = state.daily_page_views.get(&daily_key);

    let version = next_version(&current_daily_total_page_views);

    let count = current_daily_total_page_views
        .map(|v| v.count.saturating_add(1))
        .unwrap_or(1);
    
    let new_daily_page_views: DailyPageViews = DailyPageViews {
        count,
        version: Some(version),
    };

    state.daily_page_views.insert(daily_key.clone(), new_daily_page_views);

    state.satellites_daily_page_views.insert(
        DailyAnalyticSatelliteKey::from_key(&daily_key, &page_view.satellite_id),
        daily_key.clone(),
    );
    
    Ok(())
}

fn increment_daily_session_view_analytics_impl(
    daily_session_key: &DailySessionsAnalyticKey, page_view: &PageView,
    state: &mut StableState,
) -> Result<(), String> {
    let mut current_daily_session_views = state.daily_session_views.get(&daily_session_key);
    
    let version = next_version(&current_daily_session_views);

    let count = current_daily_session_views
        .as_ref()
        .map(|v| v.count.saturating_add(1))
        .unwrap_or(1);

    let mut hrefs = current_daily_session_views
        .map(|v| v.hrefs)
        .unwrap_or_else(HashSet::new);

    hrefs.insert(page_view.href.clone());

    let new_daily_session_views: DailySessionViews = DailySessionViews {
        count,
        version: Some(version),
        hrefs,
    };

    state.daily_session_views.insert(daily_session_key.clone(), new_daily_session_views);

    state.satellites_daily_session_views.insert(
        DailySessionsAnalyticSatelliteKey::from_key(&daily_session_key, &page_view.satellite_id, &page_view.session_id),
        daily_session_key.clone(),
    );

    Ok(())
}