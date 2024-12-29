use crate::constants::RETAIN_ARCHIVE_STATUSES_NS;
use crate::monitoring::store::stable::{
    delete_monitoring_history, get_monitoring_history_keys, insert_cycles_monitoring_history,
};
use crate::types::interface::GetMonitoringHistory;
use crate::types::state::{CyclesBalance, MonitoringHistoryCycles};
use canfund::manager::record::CanisterRecord;
use ic_cdk::api::management_canister::main::CanisterId;
use ic_cdk::api::time;
use std::collections::HashMap;

pub fn save_monitoring_history(records: HashMap<CanisterId, CanisterRecord>) {
    for (canister_id, record) in records.iter() {
        cleanup_monitoring_history(canister_id);

        insert_monitoring_history(canister_id, record);
    }
}

fn insert_monitoring_history(canister_id: &CanisterId, record: &CanisterRecord) {
    if let Some(cycles) = record.get_cycles() {
        let last_deposited_cycles =
            record
                .get_last_deposited_cycles()
                .clone()
                .map(|last_deposited| CyclesBalance {
                    amount: last_deposited.amount,
                    timestamp: last_deposited.timestamp,
                });

        // The `last_deposited_cycles` does not correspond to the most recent monitoring round. Instead, it represents the last time the module was topped up overall.
        // Our goal is to track the history of cycles deposited specifically by the monitoring process, which requires filtering the data appropriately.
        // Since each monitoring round is optimistically expected to collect cycles with a newer timestamp than the last deposit—given that rounds are scheduled at intervals,
        // such as one hour apart—we can use a timestamp comparison to identify the information we are looking for.
        let deposited_cycles = last_deposited_cycles
            .clone()
            .filter(|last_deposited| last_deposited.timestamp >= cycles.timestamp);

        let history_entry: MonitoringHistoryCycles = MonitoringHistoryCycles {
            cycles: CyclesBalance {
                amount: cycles.amount,
                timestamp: cycles.timestamp,
            },
            deposited_cycles,
        };

        insert_cycles_monitoring_history(canister_id, &history_entry);
    }
}

fn cleanup_monitoring_history(canister_id: &CanisterId) {
    let now = time();
    let retain_timestamp = now - RETAIN_ARCHIVE_STATUSES_NS;

    let filter: GetMonitoringHistory = GetMonitoringHistory {
        segment_id: *canister_id,
        from: None,
        to: Some(retain_timestamp),
    };

    let keys = get_monitoring_history_keys(&filter);

    for key in keys {
        delete_monitoring_history(&key);
    }
}
