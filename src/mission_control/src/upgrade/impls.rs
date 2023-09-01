use crate::types::state::{
    Archive, ArchiveStatuses, ArchiveStatusesSegments, Orbiters, StableState,
};
use crate::upgrade::types::upgrade::UpgradeStableState;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        StableState {
            controllers: state.controllers.clone(),
            user: state.user.clone(),
            satellites: state.satellites.clone(),
            archive: Archive {
                statuses: ArchiveStatuses {
                    mission_control: state.archive.statuses.mission_control.clone(),
                    satellites: state.archive.statuses.satellites.clone(),
                    orbiters: ArchiveStatusesSegments::new(),
                },
            },
            orbiters: Orbiters::new(),
        }
    }
}
