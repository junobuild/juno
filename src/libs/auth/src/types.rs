pub mod state {
    use crate::types::config::AuthenticationConfig;
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

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct AuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
        pub rules: Option<AuthenticationRules>,
        pub enabled_providers: Option<Vec<AuthenticationProvider>>,
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

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq)]
    #[serde(rename_all = "snake_case")]
    pub enum AuthenticationProvider {
        InternetIdentity,
        Nfid,
        WebAuthn,
    }
}

pub mod interface {
    use crate::types::config::{
        AuthenticationConfigInternetIdentity, AuthenticationProvider, AuthenticationRules,
    };
    use candid::{CandidType, Deserialize, Principal};
    use junobuild_shared::types::state::Version;
    use serde::Serialize;
    use serde_bytes::ByteBuf;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetAuthenticationConfig {
        pub internet_identity: Option<AuthenticationConfigInternetIdentity>,
        pub rules: Option<AuthenticationRules>,
        pub enabled_providers: Option<Vec<AuthenticationProvider>>,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct PrepareDelegationArgs {
        pub anchor_id: String, // instead of anchor_number
        pub session_key: SessionKey,
        pub frontend: FrontendHostname,
        // TODO: max_time_to_live opt<u64>
    }

    #[derive(CandidType, Deserialize)]
    pub struct GetDelegationArgs {
        pub anchor_id: String, // instead of anchor_number
        pub session_key: SessionKey,
        pub frontend: FrontendHostname,
        pub expiration: Timestamp,
    }

    pub type UserKey = PublicKey;
    pub type PublicKey = ByteBuf;
    pub type SessionKey = PublicKey;
    pub type Timestamp = u64;
    pub type FrontendHostname = String;
    pub type Signature = ByteBuf;

    #[derive(Clone, Debug, CandidType, Deserialize)]
    pub enum GetDelegationResponse {
        #[serde(rename = "signed_delegation")]
        SignedDelegation(SignedDelegation),
        #[serde(rename = "no_such_delegation")]
        NoSuchDelegation,
    }

    pub type PrepareDelegationResponse = (UserKey, Timestamp);

    #[derive(Clone, Debug, CandidType, Deserialize)]
    pub struct SignedDelegation {
        pub delegation: Delegation,
        pub signature: Signature,
    }

    #[derive(Clone, Debug, CandidType, Deserialize)]
    pub struct Delegation {
        pub pubkey: PublicKey,
        pub expiration: Timestamp,
        pub targets: Option<Vec<Principal>>,
    }
}
