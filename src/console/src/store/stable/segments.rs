use crate::store::{with_segments, with_segments_mut};
use crate::types::interface::ListSegmentsArgs;
use crate::types::state::{Segment, SegmentKey, SegmentType, SegmentsStable};
use junobuild_shared::constants_shared::{PRINCIPAL_MAX, PRINCIPAL_MIN};
use junobuild_shared::data::collect::collect_stable_vec;
use junobuild_shared::types::state::{Metadata, UserId};
use std::ops::RangeBounds;

pub fn add_segment(key: &SegmentKey, segment: &Segment) {
    with_segments_mut(|segments| {
        let _ = segments.insert(key.clone(), segment.clone());
    })
}

pub fn set_segment_metadata(key: &SegmentKey, metadata: &Metadata) -> Result<Segment, String> {
    with_segments_mut(|segments| set_segment_metadata_impl(key, metadata, segments))
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

fn set_segment_metadata_impl(
    key: &SegmentKey,
    metadata: &Metadata,
    segments: &mut SegmentsStable,
) -> Result<Segment, String> {
    let segment = segments
        .get(key)
        .ok_or_else(|| "Segment not found.".to_string())?;

    let updated_segment = segment.with_metadata(metadata);
    segments.insert(key.clone(), updated_segment.clone());

    Ok(updated_segment)
}

fn detach_segment_impl(key: &SegmentKey, segments: &mut SegmentsStable) -> Result<(), String> {
    let segment = segments.contains_key(key);

    if !segment {
        return Err("Segment not found".to_string());
    }

    segments.remove(key);

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
        user: *user,
        // Fallback to first enum
        segment_type: segment_type.clone().unwrap_or(SegmentType::Satellite),
        segment_id: segment_id.unwrap_or(PRINCIPAL_MIN),
    };

    let end_key = SegmentKey {
        user: *user,
        // Fallback to last enum
        segment_type: segment_type.clone().unwrap_or(SegmentType::Orbiter),
        segment_id: segment_id.unwrap_or(PRINCIPAL_MAX),
    };

    // Inclusive range to ensure filtering by segment_type works correctly.
    // Exclusive range (start_key..end_key) would be too narrow when start and end have the same segment_type.
    start_key..=end_key
}
