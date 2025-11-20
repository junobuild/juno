use crate::guards::caller_is_user_or_admin_controller;
use crate::monitoring::monitor::{
    get_monitoring_history as get_any_monitoring_history,
    get_monitoring_status as get_any_monitoring_status,
    start_monitoring as start_monitoring_with_current_config,
    stop_monitoring as stop_any_monitoring, update_and_start_monitoring_with_config,
    update_and_stop_monitoring_with_config,
};
use crate::types::interface::{
    GetMonitoringHistory, MonitoringStartConfig, MonitoringStatus, MonitoringStopConfig,
};
use crate::types::state::{MonitoringHistory, MonitoringHistoryKey};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;

#[update(guard = "caller_is_user_or_admin_controller")]
fn start_monitoring() {
    start_monitoring_with_current_config().unwrap_or_trap();
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn stop_monitoring() {
    stop_any_monitoring().unwrap_or_trap();
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn update_and_start_monitoring(config: MonitoringStartConfig) {
    update_and_start_monitoring_with_config(&config).unwrap_or_trap();
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn update_and_stop_monitoring(config: MonitoringStopConfig) {
    update_and_stop_monitoring_with_config(&config).unwrap_or_trap();
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_monitoring_status() -> MonitoringStatus {
    get_any_monitoring_status()
}

#[query(guard = "caller_is_user_or_admin_controller")]
fn get_monitoring_history(
    filter: GetMonitoringHistory,
) -> Vec<(MonitoringHistoryKey, MonitoringHistory)> {
    get_any_monitoring_history(&filter)
}
