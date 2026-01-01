use crate::guards::caller_has_account;
use crate::store::stable::{list_segments as list_segments_store, set_segment_metadata as set_segment_metadata_store};
use crate::types::interface::{ListSegmentsArgs, SetSegmentMetadataArgs};
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
    let key = SegmentKey::from(&caller(), &args.segment_id, args.segment_type);
    set_segment_metadata_store(&key, &args.metadata).unwrap_or_trap()
}
