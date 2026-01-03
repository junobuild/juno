use crate::segments::store::{try_add_segment, unset_segment};
use crate::types::interface::{SetSegmentsArgs, UnsetSegmentsArgs};
use crate::types::state::{Segment, SegmentKey};
use junobuild_shared::ic::api::caller;

pub fn attach_segment(args: SetSegmentsArgs) -> Result<Segment, String> {
    let key = SegmentKey::from(&caller(), &args.segment_id, args.segment_type);
    let segment = Segment::new(&args.segment_id, args.metadata);

    try_add_segment(&key, &segment)?;

    Ok(segment)
}

pub fn detach_segment(args: UnsetSegmentsArgs) -> Result<(), String> {
    let key = SegmentKey::from(&caller(), &args.segment_id, args.segment_type);

    unset_segment(&key)
}
