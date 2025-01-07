use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeStableState;

impl From<&UpgradeStableState> for HeapState {
    fn from(state: &UpgradeStableState) -> Self {
        HeapState {
            controllers: state.controllers.clone(),
            env: None,
        }
    }
}
