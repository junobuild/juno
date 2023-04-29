use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::upgrade::upgrade_controllers;

///
/// v0.0.4 -> v0.0.x:
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: upgrade_controllers(state.controllers.clone()),
            cron_controllers: state.cron_controllers.clone(),
            cron_tabs: state.cron_tabs.clone(),
            archive: state.archive.clone(),
        }
    }
}
