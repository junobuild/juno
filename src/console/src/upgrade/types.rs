pub mod upgrade {
    use crate::types::state::{InvitationCodes, MissionControls, Payments, Rates, Releases};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::upgrade::UpgradeControllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub mission_controls: MissionControls,
        pub payments: Payments,
        pub releases: Releases,
        pub invitation_codes: InvitationCodes,
        pub controllers: UpgradeControllers,
        pub rates: Rates,
    }
}
