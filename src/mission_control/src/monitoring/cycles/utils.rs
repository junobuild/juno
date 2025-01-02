use canfund::manager::record::CanisterRecord;
use junobuild_shared::types::monitoring::CyclesBalance;

pub fn get_deposited_cycles(record: &CanisterRecord) -> Option<CyclesBalance> {
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
        last_deposited_cycles
            .clone()
            .filter(|last_deposited| last_deposited.timestamp >= cycles.timestamp)
    } else {
        None
    }
}
