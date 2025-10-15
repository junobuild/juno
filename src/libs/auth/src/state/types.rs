pub mod state {
    use crate::state::types::config::AuthenticationConfig;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};

    pub type Salt = [u8; 32];

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationHeapState {
        pub config: AuthenticationConfig,
        pub salt: Option<Salt>,
    }
}

pub(crate) mod runtime_state {
    use candid::Deserialize;
    use ic_canister_sig_creation::signature_map::SignatureMap;
    use serde::Serialize;

    #[derive(Default, Serialize, Deserialize)]
    pub struct State {
        // Unstable state: State that resides only on the heap, that’s lost after an upgrade.
        #[serde(skip, default)]
        pub runtime: RuntimeState,
    }

    #[derive(Default)]
    pub struct RuntimeState {
        pub sigs: SignatureMap,
    }
}

pub mod config {
    use candid::{CandidType, Deserialize, Principal};
    use junobuild_shared::types::core::DomainName;
    use junobuild_shared::types::state::{Timestamp, Version};
    use serde::Serialize;
    use std::collections::BTreeMap;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
        pub openid: Option<AuthenticationConfigOpenId>,
        pub rules: Option<AuthenticationRules>,
        pub version: Option<Version>,
        pub created_at: Option<Timestamp>,
        pub updated_at: Option<Timestamp>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfigOpenId {
        pub providers: OpenIdProviders,
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

    pub type OpenIdProviders = BTreeMap<OpenIdProvider, OpenIdProviderConfig>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord)]
    pub enum OpenIdProvider {
        Google,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenIdProviderConfig {
        pub client_id: String,
    }
}

pub mod interface {
    use crate::state::types::config::{
        AuthenticationConfigInternetIdentity, AuthenticationConfigOpenId, AuthenticationRules,
    };
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::Version;
    use serde::Serialize;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetAuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
        pub openid: Option<AuthenticationConfigOpenId>,
        pub rules: Option<AuthenticationRules>,
        pub version: Option<Version>,
    }
}
