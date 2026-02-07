pub mod state {
    use crate::delegation::types::Timestamp;
    use crate::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
    use crate::state::types::automation::AutomationConfig;
    use crate::state::types::config::AuthenticationConfig;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type Salt = [u8; 32];

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationHeapState {
        /// Configuration for user authentication via delegation (Internet Identity, Google, GitHub).
        /// Note: Field name kept as "config" for backward compatibility during upgrades.
        pub config: AuthenticationConfig,
        /// Configuration for CI/CD authentication.
        pub automation: Option<AutomationConfig>,
        pub salt: Option<Salt>,
        pub openid: Option<OpenIdState>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenIdState {
        pub certificates: HashMap<OpenIdProvider, OpenIdCachedCertificate>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenIdCachedCertificate {
        pub certificate: Option<OpenIdCertificate>,
        pub last_fetch_attempt: OpenIdLastFetchAttempt,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenIdLastFetchAttempt {
        pub at: Timestamp,
        pub streak_count: u8,
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
    use crate::delegation::types::DelegationTargets;
    use crate::openid::types::provider::OpenIdDelegationProvider;
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
        pub providers: OpenIdAuthProviders,
        pub observatory_id: Option<Principal>,
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

    pub type OpenIdAuthProviders = BTreeMap<OpenIdDelegationProvider, OpenIdAuthProviderConfig>;

    pub type OpenIdAuthProviderClientId = String;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct OpenIdAuthProviderConfig {
        pub client_id: OpenIdAuthProviderClientId,
        pub delegation: Option<OpenIdAuthProviderDelegationConfig>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct OpenIdAuthProviderDelegationConfig {
        pub targets: Option<DelegationTargets>,
        pub max_time_to_live: Option<u64>,
    }
}

pub mod automation {
    use crate::automation::types::AutomationScope;
    use crate::openid::types::provider::OpenIdAutomationProvider;
    use candid::{CandidType, Deserialize, Principal};
    use junobuild_shared::types::state::{Timestamp, Version};
    use serde::Serialize;
    use std::collections::{BTreeMap, HashMap};

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AutomationConfig {
        pub openid: Option<AutomationConfigOpenId>,
        pub version: Option<Version>,
        pub created_at: Option<Timestamp>,
        pub updated_at: Option<Timestamp>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AutomationConfigOpenId {
        pub providers: OpenIdAutomationProviders,
        pub observatory_id: Option<Principal>,
    }

    pub type OpenIdAutomationProviders =
        BTreeMap<OpenIdAutomationProvider, OpenIdAutomationProviderConfig>;

    // Repository identifier for GitHub automation.
    // Corresponds to the `repository` claim in GitHub OIDC tokens (e.g., "octo-org/octo-repo").
    // See: https://docs.github.com/en/actions/concepts/security/openid-connect#understanding-the-oidc-token
    #[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash, Eq, PartialEq)]
    pub struct RepositoryKey {
        // Repository owner (e.g. "octo-org")
        pub owner: String,
        // Repository name (e.g. "octo-repo")
        pub name: String,
    }

    pub type OpenIdAutomationRepositories =
        HashMap<RepositoryKey, OpenIdAutomationRepositoryConfig>;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct OpenIdAutomationProviderConfig {
        pub repositories: OpenIdAutomationRepositories,
        pub controller: Option<OpenIdAutomationProviderControllerConfig>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct OpenIdAutomationRepositoryConfig {
        // Optionally restrict to specific branches (e.g. ["main", "develop"])
        pub branches: Option<Vec<String>>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct OpenIdAutomationProviderControllerConfig {
        pub scope: Option<AutomationScope>,
        pub max_time_to_live: Option<u64>,
    }
}

pub mod interface {
    use crate::state::types::automation::AutomationConfigOpenId;
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

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetAutomationConfig {
        pub openid: Option<AutomationConfigOpenId>,
        pub version: Option<Version>,
    }
}
