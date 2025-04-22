use crate::state::types::state::{AnalyticKey, AnalyticSatelliteKey};
use crate::types::interface::GetAnalytics;
use junobuild_shared::types::state::SatelliteId;
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
        satellite_id: _,
    }: &GetAnalytics,
    satellite_id: SatelliteId,
) -> impl RangeBounds<AnalyticSatelliteKey> {
    let start_key = AnalyticSatelliteKey {
        satellite_id,
        collected_at: from.unwrap_or(u64::MIN),
        key: "".to_string(),
    };

    let end_key = AnalyticSatelliteKey {
        satellite_id,
        collected_at: to.unwrap_or(u64::MAX),
        key: "".to_string(),
    };

    start_key..end_key
}
