use std::collections::HashMap;
use canfund::manager::record::CanisterRecord;
use ic_cdk::api::management_canister::main::CanisterId;
use ic_cdk::api::time;
use crate::constants::RETAIN_ARCHIVE_STATUSES_NS;
use crate::cycles_monitoring::store::stable::insert_cycles_monitoring_history;
use crate::types::state::{CyclesBalance, MonitoringHistoryCycles};

pub fn save_monitoring_history(records: HashMap<CanisterId, CanisterRecord>) {
    for (canister_id, record) in records.iter() {
        if let Some(cycles) = record.get_cycles() {
            let last_deposited_cycles =
                record
                    .get_last_deposited_cycles()
                    .clone()
                    .map(|last_deposited| CyclesBalance {
                        amount: last_deposited.amount,
                        timestamp: last_deposited.timestamp,
                    });

            let history_entry: MonitoringHistoryCycles = MonitoringHistoryCycles {
                cycles: CyclesBalance {
                    amount: cycles.amount,
                    timestamp: cycles.timestamp,
                },
                last_deposited_cycles,
            };

            insert_cycles_monitoring_history(&canister_id, &history_entry);
        }
    }
}


fn cleanup_monitoring_history(records: HashMap<CanisterId, CanisterRecord>) {
    let now = time();
    let retain_timestamp = now - RETAIN_ARCHIVE_STATUSES_NS;
}
