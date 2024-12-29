pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{
        Controllers, MissionControlId, SegmentMetadata, Timestamp,
    };
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
        pub mission_control_id: MissionControlId,
        pub status: Status,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    enum Status {
        Pending,
        Processing,
        Done,
        Failed,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum Notification {
        Email(EmailNotification),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct EmailNotification {
        pub to: String,
        pub segment: SegmentMetadata,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }
}
