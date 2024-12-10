use crate::cycles_monitoring::restart::restart_cycles_monitoring;
use crate::cycles_monitoring::start::start_cycles_monitoring;
use crate::cycles_monitoring::stop::stop_cycles_monitoring;
use crate::types::interface::{MonitoringStartConfig, MonitoringStopConfig};

pub fn restart_monitoring() -> Result<(), String> {
    restart_cycles_monitoring()
}

pub fn start_monitoring(config: &MonitoringStartConfig) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        start_cycles_monitoring(config)?
    }

    Ok(())
}

pub fn stop_monitoring(config: &MonitoringStopConfig) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        stop_cycles_monitoring(config)?
    }

    Ok(())
}
