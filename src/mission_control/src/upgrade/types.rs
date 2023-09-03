pub mod upgrade {
    use crate::types::state::{ArchiveStatusesSegments, Satellites, Statuses, User};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: Controllers,
        pub archive: UpgradeArchive,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeArchive {
        pub statuses: UpgradeArchiveStatuses,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeArchiveStatuses {
        pub mission_control: Statuses,
        pub satellites: ArchiveStatusesSegments,
    }
}
