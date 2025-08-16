use crate::memory::manager::RUNTIME_STATE;
use crate::monitoring::cycles::funding::init_funding_manager;
use crate::monitoring::cycles::funding::register_cycles_monitoring;
use crate::monitoring::store::heap::set_mission_control_strategy;
use crate::types::interface::SegmentsMonitoringStrategy;
use crate::types::runtime::RuntimeState;
use crate::types::state::CyclesMonitoringStrategy;
use junobuild_shared::ic::api::id;
use junobuild_shared::types::state::SegmentId;

type SaveSegmentStrategy = fn(&SegmentId, &CyclesMonitoringStrategy) -> Result<(), String>;

pub fn register_modules_monitoring(
    segments_strategy: &SegmentsMonitoringStrategy,
    save_strategy: SaveSegmentStrategy,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        register_modules_monitoring_impl(segments_strategy, save_strategy, &mut state.borrow_mut())
    })
}

pub fn register_mission_control_monitoring(
    strategy: &Option<CyclesMonitoringStrategy>,
) -> Result<(), String> {
    RUNTIME_STATE
        .with(|state| register_mission_control_monitoring_impl(strategy, &mut state.borrow_mut()))
}

fn register_modules_monitoring_impl(
    segments_strategy: &SegmentsMonitoringStrategy,
    save_strategy: SaveSegmentStrategy,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for segment_id in &segments_strategy.ids {
        save_strategy(segment_id, &segments_strategy.strategy)?;

        register_cycles_monitoring(fund_manager, segment_id, &segments_strategy.strategy)?;
    }

    Ok(())
}

fn register_mission_control_monitoring_impl(
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
    if strategy_exists && strategy.is_none() {
        return Ok(());
    }

    // If no strategy exists, we must register one, as no modules are observed without also observing Mission Control.
    // Regardless if we create a new strategy or update it, we need a strategy at this point.
    if strategy.is_none() {
        return Err(
            "A strategy for monitoring the missing mission control must be provided.".to_string(),
        );
    }

    let cycles_strategy = strategy.clone().unwrap();

    set_mission_control_strategy(&cycles_strategy);

    register_cycles_monitoring(fund_manager, &mission_control_id, &cycles_strategy)?;

    Ok(())
}
