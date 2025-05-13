// ---------------------------------------------------------
// History
// ---------------------------------------------------------

use crate::memory::STATE;
use crate::random::random;
use crate::types::interface::GetMonitoringHistory;
use crate::types::state::{
    MonitoringHistory, MonitoringHistoryCycles, MonitoringHistoryKey, MonitoringHistoryStable,
};
use ic_cdk::api::time;
use junobuild_shared::types::state::SegmentId;
use std::ops::RangeBounds;

pub fn insert_cycles_monitoring_history(
    segment_id: &SegmentId,
    cycles: &MonitoringHistoryCycles,
) -> Result<(), String> {
    STATE.with(|state| {
        insert_cycles_monitoring_history_impl(
            segment_id,
            cycles,
            &mut state.borrow_mut().stable.monitoring_history,
        )
    })
}

pub fn get_monitoring_history(
    filter: &GetMonitoringHistory,
) -> Vec<(MonitoringHistoryKey, MonitoringHistory)> {
    STATE.with(|state| {
        get_monitoring_history_impl(filter, &state.borrow().stable.monitoring_history)
    })
}

pub fn get_monitoring_history_keys(filter: &GetMonitoringHistory) -> Vec<MonitoringHistoryKey> {
    STATE.with(|state| {
        get_monitoring_history_keys_impl(filter, &state.borrow().stable.monitoring_history)
    })
}

pub fn delete_monitoring_history(key: &MonitoringHistoryKey) -> Option<MonitoringHistory> {
    STATE.with(|state| {
        delete_monitoring_history_impl(key, &mut state.borrow_mut().stable.monitoring_history)
    })
}

fn insert_cycles_monitoring_history_impl(
    segment_id: &SegmentId,
    cycles: &MonitoringHistoryCycles,
    history: &mut MonitoringHistoryStable,
) -> Result<(), String> {
    let entry: MonitoringHistory = MonitoringHistory {
        cycles: Some(cycles.clone()),
    };

    let key = stable_monitoring_history_key(segment_id)?;

    history.insert(key, entry);

    Ok(())
}

fn stable_monitoring_history_key(segment_id: &SegmentId) -> Result<MonitoringHistoryKey, String> {
    let nonce = random()?;

    let key = MonitoringHistoryKey {
        segment_id: *segment_id,
        created_at: time(),
        nonce,
    };

    Ok(key)
}

fn get_monitoring_history_impl(
    filter: &GetMonitoringHistory,
    history: &MonitoringHistoryStable,
) -> Vec<(MonitoringHistoryKey, MonitoringHistory)> {
    history
        .range(filter_monitoring_history_range(filter))
        .collect()
}

fn get_monitoring_history_keys_impl(
    filter: &GetMonitoringHistory,
    history: &MonitoringHistoryStable,
) -> Vec<MonitoringHistoryKey> {
    history
        .keys_range(filter_monitoring_history_range(filter))
        .collect()
}

fn filter_monitoring_history_range(
    GetMonitoringHistory {
        segment_id,
        from,
        to,
    }: &GetMonitoringHistory,
) -> impl RangeBounds<MonitoringHistoryKey> {
    let start_key = MonitoringHistoryKey {
        segment_id: *segment_id,
        created_at: from.unwrap_or(u64::MIN),
        nonce: i32::MIN,
    };

    let end_key = MonitoringHistoryKey {
        segment_id: *segment_id,
        created_at: to.unwrap_or(u64::MAX),
        nonce: i32::MIN, // We want to get all entries up to the to timestamp excluded
    };

    start_key..end_key
}

fn delete_monitoring_history_impl(
    key: &MonitoringHistoryKey,
    history: &mut MonitoringHistoryStable,
) -> Option<MonitoringHistory> {
    history.remove(key)
}
