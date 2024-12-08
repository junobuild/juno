mod funding;
mod start_cycles;
mod constants;
pub mod restart_cycles;

use crate::monitoring::restart_cycles::restart_cycles_monitoring;
use crate::monitoring::start_cycles::start_cycles_monitoring;
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
