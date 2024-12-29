pub mod state {
    use crate::memory::init_stable_state;
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Controllers, Metadata, SegmentId, Timestamp};
    use serde::Serialize;
    use junobuild_shared::types::monitoring::CyclesBalance;

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
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct NotificationKey {
        pub segment_id: SegmentId,
        pub created_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum Notification {
        DepositedCyclesEmail(DepositedCyclesEmailNotification),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DepositedCyclesEmailNotification {
        pub to: String,
        pub metadata: Option<Metadata>,
        pub deposited_cycles: CyclesBalance,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;
    use junobuild_shared::types::state::{SegmentId, UserId};
    use crate::types::state::Notification;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NotifyArgs {
        pub user: UserId,
        pub segment_id: SegmentId,
        pub notification: Notification,
    }
}