use crate::storage::types::state::StorageStableState;
use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::controllers::init_controllers;
use shared::types::state::ControllerId;

///
/// v0.0.5 -> v0.0.x
/// Migrate controllers from an Hashset of Principal to a HashMap of Principal <> Struct.
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let controller_ids = state
            .controllers
            .clone()
            .into_iter()
            .collect::<Vec<ControllerId>>();

        StableState {
            controllers: init_controllers(&controller_ids),
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
