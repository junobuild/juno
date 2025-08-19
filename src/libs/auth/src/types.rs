pub mod runtime_state {
    use candid::Deserialize;
    use ic_canister_sig_creation::signature_map::SignatureMap;
    use serde::Serialize;

    pub type Salt = [u8; 32];

    #[derive(Default, Serialize, Deserialize)]
    pub struct State {
        // Unstable state: State that resides only on the heap, that’s lost after an upgrade.
        #[serde(skip, default)]
        pub runtime: RuntimeState,
    }

    #[derive(Default)]
    pub struct RuntimeState {
        pub sigs: SignatureMap,
        pub salt: Option<Salt>,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize, Principal};
    use serde_bytes::ByteBuf;

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
