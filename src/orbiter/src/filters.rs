use crate::constants::{PRINCIPAL_MAX, PRINCIPAL_MIN};
use crate::types::interface::GetAnalytics;
use crate::types::state::{AnalyticKey, AnalyticSatelliteKey};
use std::ops::RangeBounds;

pub fn filter_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id: _,
    }: &GetAnalytics,
) -> impl RangeBounds<AnalyticKey> {
    let start_key = AnalyticKey {
        collected_at: from.unwrap_or(u64::MIN),
        key: "".to_string(),
    };

    let end_key = AnalyticKey {
        collected_at: to.unwrap_or(u64::MAX),
        key: "".to_string(),
    };

    start_key..end_key
}

pub fn filter_satellites_analytics(
    GetAnalytics {
        from,
        to,
        satellite_id,
    }: &GetAnalytics,
) -> impl RangeBounds<AnalyticSatelliteKey> {
    let start_key = AnalyticSatelliteKey {
        satellite_id: satellite_id.unwrap_or(PRINCIPAL_MIN),
        collected_at: from.unwrap_or(u64::MIN),
        key: "".to_string(),
    };

    let end_key = AnalyticSatelliteKey {
        satellite_id: satellite_id.unwrap_or(PRINCIPAL_MAX),
        collected_at: to.unwrap_or(u64::MAX),
        key: "".to_string(),
    };

    start_key..end_key
}
