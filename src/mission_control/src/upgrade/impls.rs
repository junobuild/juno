use crate::types::state::{Orbiters, StableState};
use crate::upgrade::types::upgrade::UpgradeStableState;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: state.controllers.clone(),
            user: state.user.clone(),
            satellites: state.satellites.clone(),
            archive: state.archive.clone(),
            orbiters: Orbiters::new(),
        }
    }
}
