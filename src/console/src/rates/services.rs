use crate::rates::store::increment_rate;
use junobuild_shared::types::state::SegmentKind;

pub fn increment_satellites_rate() -> Result<(), String> {
    increment_rate(&SegmentKind::Satellite)
}

pub fn increment_mission_controls_rate() -> Result<(), String> {
    increment_rate(&SegmentKind::MissionControl)
}

pub fn increment_orbiters_rate() -> Result<(), String> {
    increment_rate(&SegmentKind::Orbiter)
}

pub fn increment_canister_rate() -> Result<(), String> {
    increment_rate(&SegmentKind::Canister)
}
