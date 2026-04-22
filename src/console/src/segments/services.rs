use crate::segments::store::{try_add_segment, unset_segment};
use crate::types::interface::{SetSegmentsArgs, UnsetSegmentsArgs};
use crate::types::state::{Segment, SegmentKey};
use candid::Principal;
use junobuild_shared::ic::api::caller;

pub fn attach_many_segments(args: Vec<SetSegmentsArgs>) -> Result<Vec<Segment>, String> {
    let caller = caller();

    let mut results: Vec<Segment> = Vec::new();

    for segment_args in args {
        let result = try_attach_segment(&caller, segment_args)?;

        results.push(result);
    }

    Ok(results)
}

pub fn attach_segment(args: SetSegmentsArgs) -> Result<Segment, String> {
    try_attach_segment(&caller(), args)
}

fn try_attach_segment(caller: &Principal, args: SetSegmentsArgs) -> Result<Segment, String> {
    let key = SegmentKey::from(caller, &args.segment_id, args.segment_kind);
    let segment = Segment::new(&args.segment_id, args.metadata);

    try_add_segment(&key, &segment)?;

    Ok(segment)
}

pub fn detach_many_segments(args: Vec<UnsetSegmentsArgs>) -> Result<(), String> {
    let caller = caller();

    for segment_args in args {
        try_detach_segment(&caller, segment_args)?;
    }

    Ok(())
}

pub fn detach_segment(args: UnsetSegmentsArgs) -> Result<(), String> {
    try_detach_segment(&caller(), args)
}

fn try_detach_segment(caller: &Principal, args: UnsetSegmentsArgs) -> Result<(), String> {
    let key = SegmentKey::from(caller, &args.segment_id, args.segment_kind);

    unset_segment(&key)
}
