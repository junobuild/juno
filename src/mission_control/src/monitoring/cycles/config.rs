use crate::monitoring::cycles::register::{
    register_mission_control_monitoring, register_modules_monitoring,
};
use crate::monitoring::cycles::scheduler::{start_scheduler, stop_scheduler};
use crate::monitoring::cycles::unregister::{
    unregister_mission_control_monitoring, unregister_modules_monitoring,
};
use crate::monitoring::store::heap::{
    disable_orbiter_monitoring, disable_satellite_monitoring, set_orbiter_strategy,
    set_satellite_strategy,
};
use crate::types::interface::{CyclesMonitoringStartConfig, CyclesMonitoringStopConfig};

pub fn register_and_start_cycles_monitoring(
    config: &CyclesMonitoringStartConfig,
) -> Result<(), String> {
    // Start by registering mission control monitoring, as it is essential to monitor it if any other strategies are set.
    // Mission control acts as the funding manager and is critical for managing cycles.
    register_mission_control_monitoring(&config.mission_control_strategy)?;

    if let Some(strategy) = &config.satellites_strategy {
        register_modules_monitoring(strategy, set_satellite_strategy)?;
    }

    if let Some(strategy) = &config.orbiters_strategy {
        register_modules_monitoring(strategy, set_orbiter_strategy)?;
    }

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
