use crate::storage::types::state::StorageStableState;
use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;

///
/// v0.0.3 -> v0.0.4
///
/// - users assets must be prefixed by their respective collections
///   e.g. /yolo.jpg in collection images => /images/yolo.jpg
///
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: state.controllers.clone(),
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
