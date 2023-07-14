use crate::storage::rewrites::init_rewrites;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::state::StorageHeapState;
use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        HeapState {
            controllers: state.controllers.clone(),
            db: state.db.clone(),
            storage: StorageHeapState {
                assets: state.storage.assets.clone(),
                rules: state.storage.rules.clone(),
                config: StorageConfig {
                    headers: state.storage.config.headers.clone(),
                    rewrites: init_rewrites(),
                },
                custom_domains: state.storage.custom_domains.clone(),
            },
        }
    }
}
