use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::controllers::init_controllers;
use shared::types::state::ControllerId;

///
/// v0.0.2 -> v0.0.3
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
            controllers: init_controllers(&controller_ids),
            user: state.user.clone(),
            satellites: state.satellites.clone(),
        }
    }
}
