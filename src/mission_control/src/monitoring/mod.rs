mod funding;
mod start;
mod constants;
pub mod restart;

use crate::monitoring::start::start_cycles_monitoring;
use crate::types::interface::MonitoringConfig;

pub fn start_monitoring(config: &MonitoringConfig) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        start_cycles_monitoring(config)?
    }

    Ok(())
}
