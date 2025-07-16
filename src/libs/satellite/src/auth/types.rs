pub mod state {
    use crate::auth::types::config::AuthenticationConfig;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationHeapState {
        pub config: AuthenticationConfig,
    }
}

pub mod config {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::core::DomainName;
    use serde::Serialize;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfigInternetIdentity {
        pub derivation_origin: Option<DomainName>,
        pub external_alternative_origins: Option<Vec<DomainName>>,
    }
}
