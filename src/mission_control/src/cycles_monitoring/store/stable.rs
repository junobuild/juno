// ---------------------------------------------------------
// History
// ---------------------------------------------------------

use crate::memory::STATE;
use crate::types::state::{
    MonitoringHistory, MonitoringHistoryCycles, MonitoringHistoryKey, MonitoringHistoryStable,
};
use ic_cdk::api::time;
use junobuild_shared::types::state::SegmentId;

pub fn insert_cycles_monitoring_history(segment_id: &SegmentId, cycles: &MonitoringHistoryCycles) {
    STATE.with(|state| {
        insert_cycles_monitoring_history_impl(
            segment_id,
            cycles,
            &mut state.borrow_mut().stable.monitoring_history,
        )
    })
}

fn insert_cycles_monitoring_history_impl(
    segment_id: &SegmentId,
    cycles: &MonitoringHistoryCycles,
    history: &mut MonitoringHistoryStable,
) {
    let entry: MonitoringHistory = MonitoringHistory {
        cycles: Some(cycles.clone()),
    };

    history.insert(stable_monitoring_history_key(segment_id), entry);
}

fn stable_monitoring_history_key(segment_id: &SegmentId) -> MonitoringHistoryKey {
    MonitoringHistoryKey {
        segment_id: *segment_id,
        created_at: time(),
    }
}
