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
    use candid::{CandidType, Deserialize, Principal};
    use junobuild_shared::types::core::DomainName;
    use junobuild_shared::types::state::{Timestamp, Version};
    use serde::Serialize;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
        pub rules: Option<AuthenticationRules>,
        pub version: Option<Version>,
        pub created_at: Option<Timestamp>,
        pub updated_at: Option<Timestamp>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfigInternetIdentity {
        pub derivation_origin: Option<DomainName>,
        pub external_alternative_origins: Option<Vec<DomainName>>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationRules {
        pub allowed_callers: Vec<Principal>,
    }
}

pub mod interface {
    use crate::auth::types::config::{AuthenticationConfigInternetIdentity, AuthenticationRules};
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::Version;
    use serde::Serialize;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetAuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
        pub rules: Option<AuthenticationRules>,
        pub version: Option<Version>,
    }
}
