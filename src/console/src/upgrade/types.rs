pub mod upgrade {
    use crate::types::state::{Fees, InvitationCodes, MissionControls, Payments, Rates};
    use candid::CandidType;
    use junobuild_shared::types::state::Controllers;
    use serde::{Deserialize, Serialize};

    #[derive(Default, CandidType, Deserialize, Serialize, Clone)]
    pub struct UpgradeHeapState {
        pub mission_controls: MissionControls,
        pub payments: Payments,
        pub releases: Releases,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
        pub fees: Fees,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Releases {
        pub mission_control: Wasm,
        pub satellite: Wasm,
        pub orbiter: Wasm,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Wasm {
        pub wasm: Vec<u8>,
        pub version: Option<String>,
    }
}
