use crate::cycles_monitoring::funding::init_funding_manager;
use crate::cycles_monitoring::store::{
    disable_mission_control_monitoring, disable_orbiter_monitoring, disable_satellite_monitoring,
};
use crate::memory::RUNTIME_STATE;
use crate::types::interface::CyclesMonitoringStopConfig;
use crate::types::runtime::RuntimeState;
use ic_cdk::id;
use junobuild_shared::types::state::SegmentId;
use crate::cycles_monitoring::scheduler::stop_scheduler;

type DisableMonitoring = fn(&SegmentId) -> Result<(), String>;

pub fn stop_cycles_monitoring(config: &CyclesMonitoringStopConfig) -> Result<(), String> {
    if let Some(satellite_ids) = &config.satellite_ids {
        stop_modules_monitoring(satellite_ids, disable_satellite_monitoring)?;
    }

    if let Some(orbiter_ids) = &config.orbiter_ids {
        stop_modules_monitoring(orbiter_ids, disable_orbiter_monitoring)?;
    }

    if let Some(try_mission_control) = config.try_mission_control {
        if try_mission_control {
            stop_mission_control_monitoring()?;
        }
    }

    stop_scheduler();

    Ok(())
}

fn stop_modules_monitoring(
    segment_ids: &Vec<SegmentId>,
    disable_monitoring: DisableMonitoring,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        stop_modules_monitoring_impl(segment_ids, disable_monitoring, &mut state.borrow_mut())
    })
}

fn stop_modules_monitoring_impl(
    segment_ids: &Vec<SegmentId>,
    disable_monitoring: DisableMonitoring,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for segment_id in segment_ids {
        disable_monitoring(segment_id)?;

        fund_manager.unregister(*segment_id);
    }

    Ok(())
}

fn stop_mission_control_monitoring() -> Result<(), String> {
    RUNTIME_STATE.with(|state| stop_mission_control_monitoring_impl(&mut state.borrow_mut()))
}

fn stop_mission_control_monitoring_impl(state: &mut RuntimeState) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    let strategy_exists = fund_manager.get_canisters();

    if strategy_exists.len() > 1 {
        return Err(
            "Mission control monitoring cannot be disabled while some modules remain active."
                .to_string(),
        );
    }

    disable_mission_control_monitoring()?;

    fund_manager.unregister(id());

    Ok(())
}
