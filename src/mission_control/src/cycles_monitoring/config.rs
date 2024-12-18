use crate::cycles_monitoring::register::{
    register_mission_control_monitoring, register_modules_monitoring,
};
use crate::cycles_monitoring::scheduler::{start_scheduler, stop_scheduler};
use crate::cycles_monitoring::store::{
    disable_orbiter_monitoring, disable_satellite_monitoring, set_orbiter_strategy,
    set_satellite_strategy,
};
use crate::cycles_monitoring::unregister::{
    unregister_mission_control_monitoring, unregister_modules_monitoring,
};
use crate::types::interface::{CyclesMonitoringStartConfig, CyclesMonitoringStopConfig};

pub fn register_and_start_cycles_monitoring(
    config: &CyclesMonitoringStartConfig,
) -> Result<(), String> {
    if let Some(strategy) = &config.satellites_strategy {
        register_modules_monitoring(strategy, set_satellite_strategy)?;
    }

    if let Some(strategy) = &config.orbiters_strategy {
        register_modules_monitoring(strategy, set_orbiter_strategy)?;
    }

    register_mission_control_monitoring(&config.mission_control_strategy)?;

    start_scheduler();

    Ok(())
}

pub fn unregister_and_stop_cycles_monitoring(
    config: &CyclesMonitoringStopConfig,
) -> Result<(), String> {
    if let Some(satellite_ids) = &config.satellite_ids {
        unregister_modules_monitoring(satellite_ids, disable_satellite_monitoring)?;
    }

    if let Some(orbiter_ids) = &config.orbiter_ids {
        unregister_modules_monitoring(orbiter_ids, disable_orbiter_monitoring)?;
    }

    if let Some(try_mission_control) = config.try_mission_control {
        if try_mission_control {
            unregister_mission_control_monitoring()?;
        }
    }

    stop_scheduler();

    Ok(())
}
