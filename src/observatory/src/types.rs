pub mod state {
    use crate::memory::init_stable_state;
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::monitoring::CyclesBalance;
    use junobuild_shared::types::state::{Controllers, Metadata, SegmentId, Timestamp};
    use serde::Serialize;

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

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
        pub env: Option<Env>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct NotificationKey {
        pub segment_id: SegmentId,
        pub created_at: Timestamp,
        pub nonce: i32,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum Notification {
        DepositedCyclesEmail(DepositedCyclesEmailNotification),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum NotificationStatus {
        Pending,
        Sent,
        Failed,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DepositedCyclesEmailNotification {
        pub to: String,
        pub metadata: Option<Metadata>,
        pub deposited_cycles: CyclesBalance,
        pub status: NotificationStatus,
        pub updated_at: Timestamp,
    }

    // We acknowledge that this approach is insecure, as a compromised node could access the value.
    // However, we still prefer this method to provide some sort of protection for our proxies.
    pub type ApiKey = String;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Env {
        pub email_api_key: Option<ApiKey>,
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
    use junobuild_shared::types::state::{Metadata, SegmentId, UserId};
    use serde::Serialize;
    use junobuild_shared::types::monitoring::CyclesBalance;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum SendNotification {
        DepositedCyclesEmail(SendDepositedCyclesEmailNotification),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SendDepositedCyclesEmailNotification {
        pub to: String,
        pub metadata: Option<Metadata>,
        pub deposited_cycles: CyclesBalance,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NotifyArgs {
        pub user: UserId,
        pub segment_id: SegmentId,
        pub notification: SendNotification,
    }
}
