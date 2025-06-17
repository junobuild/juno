use crate::memory::manager::RUNTIME_STATE;
use crate::types::interface::CyclesMonitoringStatus;
use crate::types::runtime::RuntimeState;

pub fn get_cycles_monitoring_status() -> Option<CyclesMonitoringStatus> {
    RUNTIME_STATE.with(|state| get_cycles_monitoring_status_impl(&state.borrow()))
}

fn get_cycles_monitoring_status_impl(state: &RuntimeState) -> Option<CyclesMonitoringStatus> {
    state
        .fund_manager
        .as_ref()
        .map(|fund_manager| CyclesMonitoringStatus {
            running: fund_manager.is_running(),
            monitored_ids: fund_manager.get_canisters().keys().copied().collect(),
        })
}
