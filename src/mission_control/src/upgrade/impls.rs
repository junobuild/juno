use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::controllers::add_controllers as add_controllers_impl;
use shared::types::state::{ControllerId, Controllers};

///
/// v0.0.2 -> v0.0.3
/// Migrate controllers from an Hashset of Principal to a HashMap of Principal <> Struct.
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
            controllers,
            user: state.user.clone(),
            satellites: state.satellites.clone(),
        }
    }
}
