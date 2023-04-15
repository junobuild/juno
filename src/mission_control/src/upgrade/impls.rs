use crate::types::state::{Archive, StableState};
use crate::upgrade::types::upgrade::UpgradeStableState;

///
/// v0.0.4 -> v0.0.x:
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: state.controllers.clone(),
            user: state.user.clone(),
            satellites: state.satellites.clone(),
            archive: state.archive.clone(),
        }
    }
}
