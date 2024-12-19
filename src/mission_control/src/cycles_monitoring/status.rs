use crate::memory::RUNTIME_STATE;
use crate::types::interface::CurrentCyclesMonitoringStatus;
use crate::types::runtime::RuntimeState;

pub fn get_current_cycles_monitoring_status() -> Option<CurrentCyclesMonitoringStatus> {
    RUNTIME_STATE.with(|state| get_current_cycles_monitoring_status_impl(&state.borrow()))
}

fn get_current_cycles_monitoring_status_impl(
    state: &RuntimeState,
) -> Option<CurrentCyclesMonitoringStatus> {
    state
        .fund_manager
        .as_ref()
        .map(|fund_manager| CurrentCyclesMonitoringStatus {
            running: fund_manager.is_running(),
            monitored_ids: fund_manager
                .get_canisters()
                .iter()
                .map(|(id, _)| *id)
                .collect(),
        })
}
