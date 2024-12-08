use crate::cycles_monitoring::constants::DEFAULT_MISSION_CONTROL_STRATEGY;
use crate::cycles_monitoring::funding::register_cycles_monitoring;
use crate::cycles_monitoring::funding::{init_funding_manager, init_register_options};
use crate::cycles_monitoring::store::{
    set_mission_control_strategy, set_orbiter_strategy, set_satellite_strategy,
};
use crate::memory::RUNTIME_STATE;
use crate::types::interface::{CyclesMonitoringConfig, SegmentsMonitoringStrategy};
use crate::types::runtime::RuntimeState;
use crate::types::state::CyclesMonitoringStrategy;
use ic_cdk::id;
use junobuild_shared::types::state::SegmentId;

type SaveSegmentStrategy = fn(&SegmentId, &CyclesMonitoringStrategy) -> Result<(), String>;

pub fn start_cycles_monitoring(config: &CyclesMonitoringConfig) -> Result<(), String> {
    if let Some(strategy) = &config.satellites_strategy {
        start_monitoring(strategy, set_satellite_strategy)?;
    }

    if let Some(strategy) = &config.orbiters_strategy {
        start_monitoring(strategy, set_orbiter_strategy)?;
    }

    start_mission_control_monitoring(&config.mission_control_strategy)?;

    Ok(())
}

fn start_monitoring(
    segments_strategy: &SegmentsMonitoringStrategy,
    save_strategy: SaveSegmentStrategy,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        start_monitoring_impl(segments_strategy, save_strategy, &mut state.borrow_mut())
    })
}

fn start_mission_control_monitoring(
    strategy: &Option<CyclesMonitoringStrategy>,
) -> Result<(), String> {
    RUNTIME_STATE
        .with(|state| start_mission_control_monitoring_impl(strategy, &mut state.borrow_mut()))
}

fn start_monitoring_impl(
    segments_strategy: &SegmentsMonitoringStrategy,
    save_strategy: SaveSegmentStrategy,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for segment_id in &segments_strategy.ids {
        save_strategy(&segment_id, &segments_strategy.strategy)?;

        register_cycles_monitoring(fund_manager, segment_id, &segments_strategy.strategy)?;
    }

    Ok(())
}

fn start_mission_control_monitoring_impl(
    strategy: &Option<CyclesMonitoringStrategy>,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    let mission_control_id = id();

    let strategy_exists = fund_manager
        .get_canisters()
        .contains_key(&mission_control_id);

    // If a strategy for Mission Control has already been registered and no new configuration is provided, we can skip.
    // Conversely, if a new configuration is provided, it indicates an intention to update the strategy.
    // Additionally, if no strategy exists, we must register one, as no modules are observed without also observing Mission Control.
    if strategy_exists && strategy.is_none() {
        return Ok(());
    }

    let cycles_strategy = strategy.clone().unwrap_or(DEFAULT_MISSION_CONTROL_STRATEGY);

    set_mission_control_strategy(&cycles_strategy);

    register_cycles_monitoring(fund_manager, &mission_control_id, &cycles_strategy)?;

    Ok(())
}
