pub mod state {
    use crate::memory::init_stable_state;
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
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
        // TODO
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;
    use junobuild_shared::types::state::{Metadata, SegmentId, UserId};

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NotifyArgs {
        pub user: UserId,
        pub notification: NotificationArgs,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NotificationArgs {
        pub to: String,
        pub segment_id: SegmentId,
        pub metadata: Option<Metadata>,
    }
}