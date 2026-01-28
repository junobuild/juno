pub mod upgrade {
    use crate::memory::init_stable_state;
    use crate::types::state::{Env, OpenIdScheduler, Rates, StableState};
    use candid::{CandidType, Deserialize};
    use junobuild_auth::openid::types::provider::OpenIdCertificate;
    use junobuild_shared::types::state::Controllers;
    use serde::Serialize;
    use std::collections::HashMap;

    #[derive(Serialize, Deserialize)]
    pub struct UpgradeState {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: UpgradeHeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub env: Option<Env>,
        pub openid: Option<UpgradeOpenId>,
        pub rates: Option<Rates>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize)]
    pub struct UpgradeOpenId {
        pub certificates: HashMap<UpgradeOpenIdProvider, OpenIdCertificate>,
        pub schedulers: HashMap<UpgradeOpenIdProvider, OpenIdScheduler>,
    }

    #[derive(
        CandidType, Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Debug,
    )]
    pub enum UpgradeOpenIdProvider {
        Google,
        GitHub,
    }
}
