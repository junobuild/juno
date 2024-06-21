use crate::memory::init_storage_heap_state;
use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        HeapState {
            mission_controls: state.mission_controls.clone(),
            payments: state.payments.clone(),
            releases: state.releases.clone(),
            invitation_codes: state.invitation_codes.clone(),
            controllers: state.controllers.clone(),
            rates: state.rates.clone(),
            fees: state.fees.clone(),
            storage: init_storage_heap_state(),
        }
    }
}
