use crate::guards::caller_has_account;
use crate::segments::{attach_many_segments, attach_segment, detach_many_segments, detach_segment};
use crate::segments::{
    list_segments as list_segments_store, set_segment_metadata as set_segment_metadata_store,
};
use crate::types::interface::{
    ListSegmentsArgs, SetSegmentMetadataArgs, SetSegmentsArgs, UnsetSegmentsArgs,
};
use crate::types::state::{Segment, SegmentKey};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;

#[query(guard = "caller_has_account")]
fn list_segments(filter: ListSegmentsArgs) -> Vec<(SegmentKey, Segment)> {
    let caller = caller();
    list_segments_store(&caller, &filter)
}

#[update(guard = "caller_has_account")]
fn set_segment_metadata(args: SetSegmentMetadataArgs) -> Segment {
    let key = SegmentKey::from(&caller(), &args.segment_id, args.segment_kind);
    set_segment_metadata_store(&key, &args.metadata).unwrap_or_trap()
}

#[update(guard = "caller_has_account")]
fn set_segment(args: SetSegmentsArgs) -> Segment {
    attach_segment(args).unwrap_or_trap()
}

#[update(guard = "caller_has_account")]
fn set_many_segments(args: Vec<SetSegmentsArgs>) -> Vec<Segment> {
    attach_many_segments(args).unwrap_or_trap()
}

#[update(guard = "caller_has_account")]
fn unset_segment(args: UnsetSegmentsArgs) {
    detach_segment(args).unwrap_or_trap()
}

#[update(guard = "caller_has_account")]
fn unset_many_segments(args: Vec<UnsetSegmentsArgs>) {
    detach_many_segments(args).unwrap_or_trap()
}
