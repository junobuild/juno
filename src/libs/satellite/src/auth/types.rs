pub mod state {
    use crate::types::core::DomainName;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationHeapState {
        pub config: AuthenticationConfig,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfigInternetIdentity {
        pub authentication_domain: Option<DomainName>,
    }
}
