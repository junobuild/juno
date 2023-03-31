pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::notifications::NotificationsConfig;
    use shared::types::state::MissionControlId;
    use std::collections::HashMap;

    pub type MissionControlNotifications = HashMap<MissionControlId, Notifications>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub notifications: MissionControlNotifications,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Notifications {
        pub mission_control_id: MissionControlId,
        pub config: NotificationsConfig,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
