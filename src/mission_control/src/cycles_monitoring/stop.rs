use junobuild_shared::types::state::SegmentId;
use crate::cycles_monitoring::funding::init_funding_manager;
use crate::cycles_monitoring::store::{disable_orbiter_monitoring, disable_satellite_monitoring};
use crate::memory::RUNTIME_STATE;
use crate::types::interface::{CyclesMonitoringStopConfig};
use crate::types::runtime::RuntimeState;

type DisableMonitoring = fn(&SegmentId) -> Result<(), String>;

pub fn stop_cycles_monitoring(config: &CyclesMonitoringStopConfig) -> Result<(), String> {
    if let Some(satellite_ids) = &config.satellite_ids {
        stop_monitoring(satellite_ids, disable_satellite_monitoring)?;
    }

    if let Some(orbiter_ids) = &config.orbiter_ids {
        stop_monitoring(orbiter_ids, disable_orbiter_monitoring)?;
    }

    // TODO: mission control with checks

    Ok(())
}

fn stop_monitoring(
    segment_ids: &Vec<SegmentId>,
    disable_monitoring: DisableMonitoring,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        stop_monitoring_impl(segment_ids, disable_monitoring, &mut state.borrow_mut())
    })
}

fn stop_monitoring_impl(
    segment_ids: &Vec<SegmentId>,
    disable_monitoring: DisableMonitoring,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for segment_id in segment_ids {
        disable_monitoring(&segment_id)?;

        fund_manager.unregister(*segment_id);
    }

    Ok(())
}