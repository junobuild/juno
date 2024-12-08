mod constants;
mod utils;
mod funding;
pub mod restart;
mod start;

use crate::cycles_monitoring::restart::restart_cycles_monitoring;
use crate::cycles_monitoring::start::start_cycles_monitoring;
use crate::types::interface::MonitoringConfig;

pub fn restart_monitoring() -> Result<(), String> {
    restart_cycles_monitoring()
}

pub fn start_monitoring(config: &MonitoringConfig) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        start_cycles_monitoring(config)?
    }

    Ok(())
}
