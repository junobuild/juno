use crate::cycles_monitoring::funding::init_funding_manager;
use crate::cycles_monitoring::funding::register_cycles_monitoring;
use crate::memory::RUNTIME_STATE;
use crate::segments::store::{get_orbiters, get_satellites};
use crate::store::get_settings;
use crate::types::core::HasMonitoring;
use crate::types::runtime::RuntimeState;
use crate::types::state::CyclesMonitoringStrategy;
use ic_cdk::id;
use junobuild_shared::types::state::SegmentId;

type SegmentCyclesMonitoryStrategyPair = (SegmentId, CyclesMonitoringStrategy);

pub fn restart_cycles_monitoring() -> Result<(), String> {
    let satellites = get_satellites();
    let orbiters = get_orbiters();

    fn map_strategy<T>(
        segment_id: &SegmentId,
        settings: &Option<T>,
    ) -> Option<SegmentCyclesMonitoryStrategyPair>
    where
        T: HasMonitoring,
    {
        settings
            .as_ref()
            .and_then(|settings| settings.monitoring())
            .and_then(|monitoring| monitoring.cycles_strategy.as_ref())
            .map(|strategy| (*segment_id, strategy.clone()))
    }

    let satellites_strategies: Vec<SegmentCyclesMonitoryStrategyPair> = satellites
        .iter()
        .flat_map(|(satellite_id, satellite)| map_strategy(satellite_id, &satellite.settings))
        .collect();
    let orbiters_strategies: Vec<SegmentCyclesMonitoryStrategyPair> = orbiters
        .iter()
        .flat_map(|(orbiter_id, orbiter)| map_strategy(orbiter_id, &orbiter.settings))
        .collect();

    if !satellites_strategies.is_empty() {
        restart_cycles_monitoring_with_settings(&satellites_strategies)?;
    }

    if !orbiters_strategies.is_empty() {
        restart_cycles_monitoring_with_settings(&orbiters_strategies)?;
    }

    let mission_control_strategy = map_strategy(&id(), &get_settings());

    if let Some(mission_control_strategy) = mission_control_strategy {
        restart_mission_control_monitoring(&mission_control_strategy)?;
    }

    Ok(())
}

fn restart_cycles_monitoring_with_settings(
    settings: &[SegmentCyclesMonitoryStrategyPair],
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        restart_cycles_monitoring_with_settings_impl(settings, &mut state.borrow_mut())
    })
}

fn restart_mission_control_monitoring(
    strategy: &SegmentCyclesMonitoryStrategyPair,
) -> Result<(), String> {
    RUNTIME_STATE
        .with(|state| restart_mission_control_monitoring_impl(strategy, &mut state.borrow_mut()))
}

fn restart_cycles_monitoring_with_settings_impl(
    settings: &[SegmentCyclesMonitoryStrategyPair],
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for (segment_id, strategy) in settings {
        register_cycles_monitoring(fund_manager, segment_id, strategy)?;
    }

    Ok(())
}

fn restart_mission_control_monitoring_impl(
    (mission_control_id, cycles_strategy): &SegmentCyclesMonitoryStrategyPair,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    register_cycles_monitoring(fund_manager, mission_control_id, cycles_strategy)
}
