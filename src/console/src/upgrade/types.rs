pub mod upgrade {
    use crate::types::state::{InvitationCodes, MissionControls, Payments, Releases};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::UserId;
    use std::collections::HashSet;

    pub type UpgradeControllers = HashSet<UserId>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub mission_controls: MissionControls,
        pub payments: Payments,
        pub releases: Releases,
        pub invitation_codes: InvitationCodes,
        pub controllers: UpgradeControllers,
    }
}
