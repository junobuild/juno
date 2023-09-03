use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        HeapState {
            controllers: state.controllers.clone(),
            origins: state.origins.clone(),
        }
    }
}
