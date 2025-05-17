use crate::guards::caller_is_user_or_admin_controller;
use crate::monitoring::monitor::{
    update_and_start_monitoring_with_config, update_and_stop_monitoring_with_config,
};
use crate::types::interface::{
    GetMonitoringHistory, MonitoringStartConfig, MonitoringStatus, MonitoringStopConfig,
};
use crate::types::state::{MonitoringHistory, MonitoringHistoryKey};
use ic_cdk::trap;
use ic_cdk_macros::{query, update};

#[update(guard = "caller_is_user_or_admin_controller")]
fn start_monitoring() {
    crate::monitoring::monitor::start_monitoring().unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn stop_monitoring() {
    crate::monitoring::monitor::stop_monitoring().unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn update_and_start_monitoring(config: MonitoringStartConfig) {
    update_and_start_monitoring_with_config(&config).unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn update_and_stop_monitoring(config: MonitoringStopConfig) {
    update_and_stop_monitoring_with_config(&config).unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_monitoring_status() -> MonitoringStatus {
    crate::monitoring::monitor::get_monitoring_status()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_monitoring_history(
    filter: GetMonitoringHistory,
) -> Vec<(MonitoringHistoryKey, MonitoringHistory)> {
    crate::monitoring::monitor::get_monitoring_history(&filter)
}
