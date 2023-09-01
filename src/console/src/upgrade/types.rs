pub mod upgrade {
    use crate::types::state::{InvitationCodes, MissionControls, Payments, Rate, Wasm};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub mission_controls: MissionControls,
        pub payments: Payments,
        pub releases: UpgradeReleases,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: UpgradeRates,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeReleases {
        pub mission_control: Wasm,
        pub satellite: Wasm,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeRates {
        pub mission_controls: Rate,
        pub satellites: Rate,
    }
}
