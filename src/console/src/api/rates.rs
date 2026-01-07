use crate::guards::caller_is_admin_controller;
use crate::rates::{get_factory_rate, set_factory_rate};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::types::state::SegmentKind;

#[update(guard = "caller_is_admin_controller")]
fn set_rate_config(segment: SegmentKind, config: RateConfig) {
    set_factory_rate(&segment, &config).unwrap_or_trap();
}

#[query(guard = "caller_is_admin_controller")]
fn get_rate_config(segment_kind: SegmentKind) -> RateConfig {
    let rate = get_factory_rate(&segment_kind).unwrap_or_trap();
    rate.config
}
