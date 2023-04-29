use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::upgrade::upgrade_controllers;

///
/// v0.0.3 -> v0.0.x:
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            mission_controls: state.mission_controls.clone(),
            payments: state.payments.clone(),
            releases: state.releases.clone(),
            invitation_codes: state.invitation_codes.clone(),
            controllers: upgrade_controllers(state.controllers.clone()),
            rates: state.rates.clone(),
        }
    }
}
