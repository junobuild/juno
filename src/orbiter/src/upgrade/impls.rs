use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;
use std::collections::HashMap;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        HeapState {
            controllers: state.controllers.clone(),
            config: HashMap::new(),
        }
    }
}
