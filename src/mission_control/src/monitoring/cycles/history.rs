use crate::constants::RETAIN_ARCHIVE_STATUSES_NS;
use crate::monitoring::cycles::utils::{get_deposited_cycles, get_funding_failure};
use crate::monitoring::store::stable::{
    delete_monitoring_history, get_monitoring_history_keys, insert_cycles_monitoring_history,
};
use crate::types::interface::GetMonitoringHistory;
use crate::types::state::MonitoringHistoryCycles;
use canfund::manager::record::CanisterRecord;
use ic_cdk::api::management_canister::main::CanisterId;
use ic_cdk::api::time;
use ic_cdk::print;
use junobuild_shared::types::monitoring::CyclesBalance;
use std::collections::HashMap;

pub fn save_monitoring_history(records: &HashMap<CanisterId, CanisterRecord>) {
    for (canister_id, record) in records.iter() {
        cleanup_monitoring_history(canister_id);

        insert_monitoring_history(canister_id, record);
    }
}

fn insert_monitoring_history(canister_id: &CanisterId, record: &CanisterRecord) {
    if let Some(cycles) = record.get_cycles() {
        let deposited_cycles = get_deposited_cycles(record);
        let funding_failure = get_funding_failure(record);

        let history_entry: MonitoringHistoryCycles = MonitoringHistoryCycles {
            cycles: CyclesBalance {
                amount: cycles.amount,
                timestamp: cycles.timestamp,
            },
            deposited_cycles,
            funding_failure,
        };

        insert_cycles_monitoring_history(canister_id, &history_entry).unwrap_or_else(|e| {
            // Error would mean the random generator is not initialized.
            #[allow(clippy::disallowed_methods)]
            print(format!("Failed to insert cycles monitoring history: {e:?}"))
        });
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
