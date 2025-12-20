use crate::store::{with_segments, with_segments_mut};
use crate::types::interface::ListSegmentsArgs;
use crate::types::state::{Segment, SegmentKey, SegmentType, SegmentsStable};
use candid::Principal;
use junobuild_shared::constants_shared::{PRINCIPAL_MAX, PRINCIPAL_MIN};
use junobuild_shared::structures::collect_stable_vec;
use junobuild_shared::types::state::UserId;
use std::ops::RangeBounds;

pub fn add_segment(key: &SegmentKey, segment: &Segment) {
    with_segments_mut(|segments| {
        let _ = segments.insert(key.clone(), segment.clone());
    })
}

pub fn list_segments(user: &UserId, filter: &ListSegmentsArgs) -> Vec<(SegmentKey, Segment)> {
    with_segments(|segments| list_segments_impl(user, filter, segments))
}

pub fn detach_segment(key: &SegmentKey) -> Result<(), String> {
    with_segments_mut(|segments| detach_segment_impl(key, segments))
}

fn list_segments_impl(
    user: &UserId,
    filter: &ListSegmentsArgs,
    segments: &SegmentsStable,
) -> Vec<(SegmentKey, Segment)> {
    collect_stable_vec(segments.range(filter_segments_range(user, filter)))
}

fn detach_segment_impl(key: &SegmentKey, segments: &mut SegmentsStable) -> Result<(), String> {
    let segment = segments.contains_key(&key);

    if !segment {
        return Err("Segment not found".to_string());
    }

    segments.remove(&key);

    Ok(())
}

fn filter_segments_range(
    user: &UserId,
    ListSegmentsArgs {
        segment_id,
        segment_type,
    }: &ListSegmentsArgs,
) -> impl RangeBounds<SegmentKey> {
    let start_key = SegmentKey {
        user: user.clone(),
        // Fallback to first enum
        segment_type: segment_type.clone().unwrap_or(SegmentType::Satellite),
        segment_id: segment_id.unwrap_or(PRINCIPAL_MIN),
    };

    let end_key = SegmentKey {
        user: user.clone(),
        // Fallback to last enum
        segment_type: segment_type.clone().unwrap_or(SegmentType::Orbiter),
        segment_id: segment_id.unwrap_or(PRINCIPAL_MAX),
    };

    // Inclusive range to ensure filtering by segment_type works correctly.
    // Exclusive range (start_key..end_key) would be too narrow when start and end have the same segment_type.
    start_key..=end_key
}
