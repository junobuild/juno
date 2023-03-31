pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::state::{MissionControlId, UserId};
    use std::collections::HashMap;

    pub type MissionControls = HashMap<MissionControlId, MissionControl>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub mission_controls: MissionControls,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MissionControl {
        pub mission_control_id: MissionControlId,
        pub owner: UserId,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
