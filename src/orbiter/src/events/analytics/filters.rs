use crate::state::types::state::{AnalyticKey, AnalyticSatelliteKey};
use crate::types::interface::GetAnalytics;
use junobuild_shared::types::state::SatelliteId;
use std::ops::RangeBounds;
use junobuild_shared::day::start_of_day;
use crate::state::types::state::analytics::{DailyAnalyticKey, DailyAnalyticSatelliteKey, DailySessionsAnalyticKey, DailySessionsAnalyticSatelliteKey};

pub fn filter_daily_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id: _,
        method: _
    }: &GetAnalytics,
) -> impl RangeBounds<DailyAnalyticKey> {
    let start_key = DailyAnalyticKey {
        start_of_day: from
            .map(|from| start_of_day(&from).unwrap_or(from)) // We fallback for simplicity reasons
            .unwrap_or(u64::MIN),
    };

    let end_key = DailyAnalyticKey {
        start_of_day: to
            .map(|to| start_of_day(&to).unwrap_or(to))
            .unwrap_or(u64::MAX),
    };

    start_key..end_key
}

pub fn filter_daily_satellites_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id: _,
        method: _
    }: &GetAnalytics,
    satellite_id: SatelliteId,
) -> impl RangeBounds<DailyAnalyticSatelliteKey> {
    let start_key = DailyAnalyticSatelliteKey {
        satellite_id,
        start_of_day: from
            .map(|from| start_of_day(&from).unwrap_or(from)) // We fallback for simplicity reasons
            .unwrap_or(u64::MIN),
    };

    let end_key = DailyAnalyticSatelliteKey {
        satellite_id,
        start_of_day: to
            .map(|to| start_of_day(&to).unwrap_or(to))
            .unwrap_or(u64::MAX),
    };

    start_key..end_key
}

pub fn filter_daily_sessions_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id: _,
        method: _
    }: &GetAnalytics,
) -> impl RangeBounds<DailySessionsAnalyticKey> {
    let start_key = DailySessionsAnalyticKey {
        start_of_day: from
            .map(|from| start_of_day(&from).unwrap_or(from)) // We fallback for simplicity reasons
            .unwrap_or(u64::MIN),
        session_id: "".to_string()
    };

    let end_key = DailySessionsAnalyticKey {
        start_of_day: to
            .map(|to| start_of_day(&to).unwrap_or(to))
            .unwrap_or(u64::MAX),
        session_id: "".to_string()
    };

    start_key..end_key
}

pub fn filter_daily_sessions_satellites_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id: _,
        method: _
    }: &GetAnalytics,
    satellite_id: SatelliteId,
) -> impl RangeBounds<DailySessionsAnalyticSatelliteKey> {
    let start_key = DailySessionsAnalyticSatelliteKey {
        satellite_id,
        start_of_day: from
            .map(|from| start_of_day(&from).unwrap_or(from)) // We fallback for simplicity reasons
            .unwrap_or(u64::MIN),
        session_id: "".to_string()
    };

    let end_key = DailySessionsAnalyticSatelliteKey {
        satellite_id,
        start_of_day: to
            .map(|to| start_of_day(&to).unwrap_or(to))
            .unwrap_or(u64::MAX),
        session_id: "".to_string()
    };

    start_key..end_key
}
