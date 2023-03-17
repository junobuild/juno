use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::controllers::init_controllers;
use shared::types::state::ControllerId;

///
/// v0.0.1 -> v0.0.x
/// Migrate controllers from an Hashset of Principal to a HashMap of Principal <> Struct.
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let controller_ids = state
            .controllers
            .clone()
            .into_iter()
            .collect::<Vec<ControllerId>>();

        StableState {
            mission_controls: state.mission_controls.clone(),
            payments: state.payments.clone(),
            releases: state.releases.clone(),
            invitation_codes: state.invitation_codes.clone(),
            controllers: init_controllers(&controller_ids),
        }
    }
}
