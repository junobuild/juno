pub mod state {
    use crate::memory::init_stable_state;
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_auth::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{
        Controllers, NotificationKind, Segment, SegmentId, Timestamp,
    };
    use serde::Serialize;
    use std::collections::HashMap;

    pub type NotificationsStable = StableBTreeMap<NotificationKey, Notification, Memory>;

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: HeapState,
    }

    pub struct StableState {
        pub notifications: NotificationsStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub env: Option<Env>,
        pub openid: Option<OpenId>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct NotificationKey {
        pub segment_id: SegmentId,
        pub created_at: Timestamp,
        pub nonce: i32,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Notification {
        pub segment: Segment,
        pub kind: NotificationKind,
        pub status: NotificationStatus,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum NotificationStatus {
        Pending,
        Sent,
        Failed,
    }

    // We acknowledge that this approach is insecure, as a compromised node could access the value.
    // However, we still prefer this method to provide some sort of protection for our proxies.
    pub type ApiKey = String;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Env {
        pub email_api_key: Option<ApiKey>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize)]
    pub struct OpenId {
        pub certificates: HashMap<OpenIdProvider, OpenIdCertificate>,
        pub schedulers: HashMap<OpenIdProvider, OpenIdScheduler>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Default)]
    pub struct OpenIdScheduler {
        pub enabled: bool,
    }
}

pub mod runtime {
    use rand::prelude::StdRng;

    #[derive(Default)]
    pub struct RuntimeState {
        pub rng: Option<StdRng>, // rng = Random Number Generator
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::{SegmentId, Timestamp};
    use serde::Serialize;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct GetNotifications {
        pub segment_id: Option<SegmentId>,
        pub from: Option<Timestamp>,
        pub to: Option<Timestamp>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NotifyStatus {
        pub pending: u64,
        pub sent: u64,
        pub failed: u64,
    }
}
