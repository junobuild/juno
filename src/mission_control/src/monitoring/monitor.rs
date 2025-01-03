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
use crate::types::state::{MonitoringConfig, MonitoringHistory, MonitoringHistoryKey};
use ic_cdk::spawn;
use ic_cdk::trap;
use ic_cdk_timers::set_timer;
use std::time::Duration;
use crate::monitoring::store::heap::set_mission_control_config;

pub fn defer_restart_monitoring() {
    set_timer(Duration::ZERO, || spawn(restart_monitoring()));
}

async fn restart_monitoring() {
    start_cycles_monitoring(true).unwrap_or_else(|e| trap(&e));
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

pub fn update_monitoring_config(config: &Option<MonitoringConfig>) {
    set_mission_control_config(config);
}