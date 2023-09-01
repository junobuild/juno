use crate::types::state::{Rates, Releases, StableState};
use crate::upgrade::types::upgrade::UpgradeStableState;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            mission_controls: state.mission_controls.clone(),
            payments: state.payments.clone(),
            releases: Releases {
                mission_control: state.releases.mission_control.clone(),
                satellite: state.releases.satellite.clone(),
                ..Releases::default()
            },
            invitation_codes: state.invitation_codes.clone(),
            controllers: state.controllers.clone(),
            rates: Rates {
                mission_controls: state.rates.mission_controls.clone(),
                satellites: state.rates.satellites.clone(),
                ..Rates::default()
            },
        }
    }
}
