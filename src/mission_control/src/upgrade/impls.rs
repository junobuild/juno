use crate::types::state::{Archive, StableState};
use crate::upgrade::types::upgrade::UpgradeStableState;

///
/// v0.0.3 -> v0.0.4:
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: state.controllers.clone(),
            user: state.user.clone(),
            satellites: state.satellites.clone(),
            archive: Archive::new(),
        }
    }
}
