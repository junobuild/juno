use crate::guards::caller_is_admin_controller;
use crate::store::heap::{
    update_mission_controls_rate_config, update_orbiters_rate_config, update_satellites_rate_config,
};
use ic_cdk_macros::update;
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::types::state::SegmentKind;

#[update(guard = "caller_is_admin_controller")]
fn update_rate_config(segment: SegmentKind, config: RateConfig) {
    match segment {
        SegmentKind::Satellite => update_satellites_rate_config(&config),
        SegmentKind::MissionControl => update_mission_controls_rate_config(&config),
        SegmentKind::Orbiter => update_orbiters_rate_config(&config),
    }
}
