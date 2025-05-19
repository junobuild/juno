use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;
use junobuild_cdn::lifecycle::init_cdn_storage_heap_state;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        HeapState {
            user: state.user.clone(),
            satellites: state.satellites.clone(),
            controllers: state.controllers.clone(),
            orbiters: state.orbiters.clone(),
            settings: state.settings.clone(),
            storage: init_cdn_storage_heap_state(),
        }
    }
}
