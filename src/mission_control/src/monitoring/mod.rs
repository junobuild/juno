mod cycles;
mod config;

use crate::monitoring::cycles::start_cycles_monitoring;
use crate::types::interface::MonitoringConfig;

pub fn restart_monitoring() {

}

pub fn start_monitoring(config: &MonitoringConfig) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        start_cycles_monitoring(config)?
    }

    Ok(())
}