use crate::store::stable::{detach_segment, list_segments as list_segments_store};
use crate::types::interface::ListSegmentsArgs;
use crate::types::state::{Segment, SegmentKey, SegmentType};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::state::SegmentId;

#[query]
fn list_segments(filter: ListSegmentsArgs) -> Vec<(SegmentKey, Segment)> {
    let caller = caller();
    list_segments_store(&caller, &filter)
}

#[update]
fn unset_many_segments(segment_ids: Vec<(SegmentId, SegmentType)>) {
    let caller = caller();

    for (segment_id, segment_type) in segment_ids {
        detach_segment(&SegmentKey::from(&caller, &segment_id, segment_type)).unwrap_or_trap();
    }
}
