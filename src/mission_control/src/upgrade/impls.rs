use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        HeapState {
            user: state.user.clone(),
            satellites: state.satellites.clone(),
            controllers: state.controllers.clone(),
            orbiters: state.orbiters.clone(),
            settings: state.settings.clone(),
        }
    }
}
