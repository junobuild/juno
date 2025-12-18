use crate::store::stable::{list_segments as list_segments_store};
use crate::types::interface::ListSegmentsArgs;
use crate::types::state::{Segment, SegmentKey};
use ic_cdk_macros::{query};
use junobuild_shared::ic::api::caller;

#[query]
fn list_segments(filter: ListSegmentsArgs) -> Vec<(SegmentKey, Segment)> {
    let caller = caller();
    list_segments_store(&caller, &filter)
}
