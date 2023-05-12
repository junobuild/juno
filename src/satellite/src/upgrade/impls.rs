use crate::storage::types::state::StorageStableState;
use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::types::state::ControllerScope;
use shared::upgrade::upgrade_controllers;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: upgrade_controllers(state.controllers.clone(), ControllerScope::Admin),
            db: state.db.clone(),
            storage: StorageStableState {
                assets: state.storage.assets.clone(),
                rules: state.storage.rules.clone(),
                config: state.storage.config.clone(),
                custom_domains: state.storage.custom_domains.clone(),
            },
        }
    }
}
