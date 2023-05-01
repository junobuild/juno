use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::types::state::ControllerScope;
use shared::upgrade::upgrade_controllers;

///
/// v0.0.4 -> v0.0.x:
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: upgrade_controllers(state.controllers.clone(), ControllerScope::Admin),
            cron_controllers: upgrade_controllers(
                state.cron_controllers.clone(),
                ControllerScope::Write,
            ),
            cron_tabs: state.cron_tabs.clone(),
            archive: state.archive.clone(),
        }
    }
}
