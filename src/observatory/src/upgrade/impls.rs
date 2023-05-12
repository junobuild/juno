use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::types::state::ControllerScope;
use shared::upgrade::upgrade_controllers;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let mut controllers =
            upgrade_controllers(state.controllers.clone(), ControllerScope::Admin);
        let cron_controllers =
            upgrade_controllers(state.cron_controllers.clone(), ControllerScope::Write);
        controllers.extend(cron_controllers);

        StableState {
            controllers: controllers.clone(),
            cron_tabs: state.cron_tabs.clone(),
            archive: state.archive.clone(),
        }
    }
}
