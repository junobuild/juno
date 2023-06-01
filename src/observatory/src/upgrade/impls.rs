use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: state.controllers.clone(),
            cron_tabs: state.cron_tabs.clone(),
            archive: state.archive.clone(),
        }
    }
}
