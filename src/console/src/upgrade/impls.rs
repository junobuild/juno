use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::controllers::add_controllers as add_controllers_impl;
use shared::types::state::{ControllerId, Controllers};

///
/// v0.0.1 -> v0.0.x
///
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let mut controllers: Controllers = Controllers::new();
        let controller_ids = state
            .controllers
            .clone()
            .into_iter()
            .collect::<Vec<ControllerId>>();
        add_controllers_impl(&controller_ids, &mut controllers);

        StableState {
            mission_controls: state.mission_controls.clone(),
            payments: state.payments.clone(),
            releases: state.releases.clone(),
            invitation_codes: state.invitation_codes.clone(),
            controllers,
        }
    }
}
