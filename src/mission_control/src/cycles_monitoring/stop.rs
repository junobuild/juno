use junobuild_shared::types::state::SegmentId;
use crate::cycles_monitoring::funding::init_funding_manager;
use crate::memory::RUNTIME_STATE;
use crate::types::interface::{CyclesMonitoringStopConfig, SegmentsMonitoringStrategy};
use crate::types::runtime::RuntimeState;

pub fn stop_cycles_monitoring(config: &CyclesMonitoringStopConfig) -> Result<(), String> {
    if let Some(satellite_ids) = &config.satellite_ids {
        stop_monitoring(satellite_ids)?;
    }

    if let Some(orbiter_ids) = &config.orbiter_ids {
        stop_monitoring(orbiter_ids)?;
    }

    // TODO: mission control with checks

    Ok(())
}

fn stop_monitoring(
    segment_ids: &Vec<SegmentId>,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        stop_monitoring_impl(segment_ids, &mut state.borrow_mut())
    })
}

fn stop_monitoring_impl(
    segment_ids: &Vec<SegmentId>,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for segment_id in &segment_ids {
        // TODO
    }

    Ok(())
}