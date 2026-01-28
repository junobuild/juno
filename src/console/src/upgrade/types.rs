pub mod upgrade {
    use crate::memory::manager::init_stable_state;
    use crate::types::state::{
        Accounts, FactoryFees, FactoryRates, IcpPayments, InvitationCodes, ReleasesMetadata,
        StableState,
    };
    use candid::{CandidType, Deserialize};
    use junobuild_auth::state::types::config::AuthenticationConfig;
    use junobuild_auth::state::types::state::{OpenIdCachedCertificate, Salt};
    use junobuild_shared::types::state::Controllers;
    use junobuild_storage::types::state::StorageHeapState;
    use serde::Serialize;
    use std::collections::HashMap;

    #[derive(Serialize, Deserialize)]
    pub struct UpgradeState {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: UpgradeHeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub mission_controls: Accounts,
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub payments: IcpPayments,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub factory_fees: Option<FactoryFees>,
        pub factory_rates: Option<FactoryRates>,
        pub storage: StorageHeapState,
        pub authentication: Option<UpgradeAuthenticationHeapState>,
        pub releases_metadata: ReleasesMetadata,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeAuthenticationHeapState {
        pub config: AuthenticationConfig,
        pub salt: Option<Salt>,
        pub openid: Option<UpgradeOpenIdState>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeOpenIdState {
        pub certificates: HashMap<UpgradeOpenIdProvider, OpenIdCachedCertificate>,
    }

    #[derive(
        CandidType, Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Debug,
    )]
    pub enum UpgradeOpenIdProvider {
        Google,
        GitHub,
    }
}
