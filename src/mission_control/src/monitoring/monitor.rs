use crate::monitoring::cycles::config::{
    register_and_start_cycles_monitoring, unregister_and_stop_cycles_monitoring,
};
use crate::monitoring::cycles::start::start_cycles_monitoring;
use crate::monitoring::cycles::status::get_cycles_monitoring_status;
use crate::monitoring::cycles::stop::stop_cycles_monitoring;
use crate::monitoring::store::stable::get_monitoring_history as get_monitoring_history_store;
use crate::types::interface::{
    GetMonitoringHistory, MonitoringStartConfig, MonitoringStatus, MonitoringStopConfig,
};
use crate::types::state::{MonitoringHistory, MonitoringHistoryKey};
use ic_cdk::futures::spawn_017_compat;
use ic_cdk_timers::set_timer;
use junobuild_shared::ic::UnwrapOrTrap;
use std::time::Duration;

pub fn defer_restart_monitoring() {
    set_timer(Duration::ZERO, || spawn_017_compat(restart_monitoring()));
}

async fn restart_monitoring() {
    start_cycles_monitoring(true).unwrap_or_trap();
}

pub fn start_monitoring() -> Result<(), String> {
    start_cycles_monitoring(false)
}

pub fn stop_monitoring() -> Result<(), String> {
    stop_cycles_monitoring()
}

pub fn update_and_start_monitoring_with_config(
    config: &MonitoringStartConfig,
) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        register_and_start_cycles_monitoring(config)?
    }

    Ok(())
}

pub fn update_and_stop_monitoring_with_config(config: &MonitoringStopConfig) -> Result<(), String> {
    if let Some(config) = &config.cycles_config {
        unregister_and_stop_cycles_monitoring(config)?
    }

    Ok(())
}

pub fn get_monitoring_status() -> MonitoringStatus {
    MonitoringStatus {
        cycles: get_cycles_monitoring_status(),
    }
}

pub fn get_monitoring_history(
    filter: &GetMonitoringHistory,
) -> Vec<(MonitoringHistoryKey, MonitoringHistory)> {
    get_monitoring_history_store(filter)
}
