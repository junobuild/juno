use crate::cycles_monitoring::restart::restart_cycles_monitoring;
use crate::cycles_monitoring::start::start_cycles_monitoring;
use crate::cycles_monitoring::stop::stop_cycles_monitoring;
use crate::types::interface::{MonitoringStartConfig, MonitoringStopConfig};
use ic_cdk::spawn;
use ic_cdk::trap;
use ic_cdk_timers::set_timer;
use std::time::Duration;

pub fn defer_restart_monitoring() {
    set_timer(Duration::ZERO, || spawn(restart_monitoring()));
}

async fn restart_monitoring() {
    restart_cycles_monitoring().unwrap_or_else(|e| trap(&e));
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
