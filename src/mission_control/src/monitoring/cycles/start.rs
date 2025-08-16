use crate::memory::manager::RUNTIME_STATE;
use crate::monitoring::cycles::funding::init_funding_manager;
use crate::monitoring::cycles::funding::register_cycles_monitoring;
use crate::monitoring::cycles::scheduler::{
    assert_scheduler_stopped, reset_scheduler, start_scheduler,
};
use crate::monitoring::store::heap::{
    enable_mission_control_monitoring, enable_orbiter_monitoring, enable_satellite_monitoring,
};
use crate::segments::store::{get_orbiters, get_satellites};
use crate::types::core::SettingsMonitoring;
use crate::types::runtime::RuntimeState;
use crate::types::state::CyclesMonitoringStrategy;
use crate::user::store::get_settings;
use junobuild_shared::ic::id;
use junobuild_shared::types::state::SegmentId;

type SegmentCyclesMonitoryStrategyPair = (SegmentId, CyclesMonitoringStrategy);

type EnableMonitoring = fn(&SegmentId) -> Result<(), String>;

/// Starts cycles monitoring.
///
/// # Parameters
/// - `enabled_only`: If `true`, only restarts monitoring for modules that are currently enabled without updating their states.
///   This is useful when monitoring needs to be restarted after an upgrade.
pub fn start_cycles_monitoring(enabled_only: bool) -> Result<(), String> {
    assert_scheduler_stopped()?;

    reset_scheduler();

    register_strategies(enabled_only)?;

    start_scheduler();

    Ok(())
}

fn register_strategies(enabled_only: bool) -> Result<(), String> {
    let satellites = get_satellites();
    let orbiters = get_orbiters();

    fn map_strategy<T>(
        segment_id: &SegmentId,
        settings: &Option<T>,
        enabled_only: bool,
    ) -> Option<SegmentCyclesMonitoryStrategyPair>
    where
        T: SettingsMonitoring,
    {
        settings
            .as_ref()
            .and_then(|settings| settings.monitoring())
            .and_then(|monitoring| monitoring.cycles.as_ref())
            .filter(|cycles| !enabled_only || cycles.enabled)
            .and_then(|cycles| cycles.strategy.as_ref())
            .map(|strategy| (*segment_id, strategy.clone()))
    }

    let satellites_strategies: Vec<SegmentCyclesMonitoryStrategyPair> = satellites
        .iter()
        .flat_map(|(satellite_id, satellite)| {
            map_strategy(satellite_id, &satellite.settings, enabled_only)
        })
        .collect();
    let orbiters_strategies: Vec<SegmentCyclesMonitoryStrategyPair> = orbiters
        .iter()
        .flat_map(|(orbiter_id, orbiter)| map_strategy(orbiter_id, &orbiter.settings, enabled_only))
        .collect();

    if !satellites_strategies.is_empty() {
        register_cycles_monitoring_with_settings(
            &satellites_strategies,
            if enabled_only {
                None
            } else {
                Some(enable_satellite_monitoring)
            },
        )?;
    }

    if !orbiters_strategies.is_empty() {
        register_cycles_monitoring_with_settings(
            &orbiters_strategies,
            if enabled_only {
                None
            } else {
                Some(enable_orbiter_monitoring)
            },
        )?;
    }

    let mission_control_strategy = map_strategy(&id(), &get_settings(), enabled_only);

    if let Some(mission_control_strategy) = mission_control_strategy {
        register_mission_control_monitoring(&mission_control_strategy, !enabled_only)?;
    }

    Ok(())
}

fn register_cycles_monitoring_with_settings(
    settings: &[SegmentCyclesMonitoryStrategyPair],
    enable_monitoring: Option<EnableMonitoring>,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        register_cycles_monitoring_with_settings_impl(
            settings,
            enable_monitoring,
            &mut state.borrow_mut(),
        )
    })
}

fn register_mission_control_monitoring(
    strategy: &SegmentCyclesMonitoryStrategyPair,
    enable_monitoring: bool,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        register_mission_control_monitoring_impl(
            strategy,
            enable_monitoring,
            &mut state.borrow_mut(),
        )
    })
}

fn register_cycles_monitoring_with_settings_impl(
    settings: &[SegmentCyclesMonitoryStrategyPair],
    enable_monitoring: Option<EnableMonitoring>,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for (segment_id, strategy) in settings {
        if let Some(enable_monitoring) = enable_monitoring {
            enable_monitoring(segment_id)?;
        }

        register_cycles_monitoring(fund_manager, segment_id, strategy)?;
    }

    Ok(())
}

fn register_mission_control_monitoring_impl(
    (mission_control_id, cycles_strategy): &SegmentCyclesMonitoryStrategyPair,
    enable_monitoring: bool,
    state: &mut RuntimeState,
) -> Result<(), String> {
    if enable_monitoring {
        enable_mission_control_monitoring()?;
    }

    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    register_cycles_monitoring(fund_manager, mission_control_id, cycles_strategy)
}
