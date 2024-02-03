pub mod upgrade {
    use crate::types::state::{Fees, InvitationCodes, MissionControls, Payments, Rates, Releases};
    use candid::CandidType;
    use junobuild_shared::types::state::Controllers;
    use serde::Deserialize;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub mission_controls: MissionControls,
        pub payments: Payments,
        pub releases: Releases,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
        pub fees: Fees,
    }
}
