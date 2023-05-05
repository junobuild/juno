pub mod upgrade {
    use crate::types::state::{Archive, Satellites, User};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::upgrade::UpgradeControllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: UpgradeControllers,
        pub archive: Archive,
    }
}
