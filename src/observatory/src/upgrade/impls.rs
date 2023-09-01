use crate::types::state::{Archive, StableState};
use crate::upgrade::types::upgrade::UpgradeStableState;
use std::collections::HashMap;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        // For simplicity reason, no migration of the statuses. A new batch will collect the new statuses.

        StableState {
            controllers: state.controllers.clone(),
            cron_tabs: state.cron_tabs.clone(),
            archive: Archive {
                statuses: HashMap::new(),
            },
        }
    }
}
