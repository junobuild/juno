use crate::cycles_monitoring::scheduler::{assert_scheduler_running, stop_scheduler};
use crate::cycles_monitoring::store::heap::{
    disable_orbiter_monitoring, disable_satellite_monitoring,
};
use crate::cycles_monitoring::unregister::{
    unregister_mission_control_monitoring, unregister_modules_monitoring,
};
use crate::segments::store::{get_orbiters, get_satellites};
use crate::types::core::SettingsMonitoring;
use junobuild_shared::types::state::SegmentId;

pub fn stop_cycles_monitoring() -> Result<(), String> {
    assert_scheduler_running()?;

    unregister_strategies()?;

    stop_scheduler();

    Ok(())
}

fn unregister_strategies() -> Result<(), String> {
    let satellites = get_satellites();
    let orbiters = get_orbiters();

    fn filter_enabled_strategy<T>(segment_id: &SegmentId, settings: &Option<T>) -> Option<SegmentId>
    where
        T: SettingsMonitoring,
    {
        settings
            .as_ref()
            .and_then(|settings| settings.monitoring())
            .and_then(|monitoring| monitoring.cycles.as_ref())
            .filter(|cycles| cycles.enabled)
            .map(|_| *segment_id)
    }

    let satellite_ids: Vec<SegmentId> = satellites
        .iter()
        .filter_map(|(satellite_id, satellite)| {
            filter_enabled_strategy(satellite_id, &satellite.settings)
        })
        .collect();
    let orbiter_ids: Vec<SegmentId> = orbiters
        .iter()
        .filter_map(|(orbiter_id, orbiter)| filter_enabled_strategy(orbiter_id, &orbiter.settings))
        .collect();

    if !satellite_ids.is_empty() {
        unregister_modules_monitoring(&satellite_ids, disable_satellite_monitoring)?;
    }

    if !orbiter_ids.is_empty() {
        unregister_modules_monitoring(&orbiter_ids, disable_orbiter_monitoring)?;
    }

    unregister_mission_control_monitoring()?;

    Ok(())
}
