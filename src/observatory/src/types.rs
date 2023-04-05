pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::interface::SegmentsStatuses;
    use shared::types::state::{Controllers, MissionControlId};
    use std::collections::HashMap;

    pub type CronTabs = HashMap<MissionControlId, CronTab>;
    pub type Statuses = HashMap<MissionControlId, MissionControlStatuses>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
        pub runtime: RuntimeState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        // Controllers of the observatory - i.e. of the canister (can start, stop the canister etc.)
        pub controllers: Controllers,
        // Additional controllers which can start and collect results of the cron_jobs only
        pub cron_controllers: Controllers,
        pub cron_tabs: CronTabs,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct RuntimeState {
        pub statuses: Statuses,
    }

    #[derive(Clone, CandidType, Deserialize)]
    pub struct MissionControlStatuses {
        pub statuses: Result<SegmentsStatuses, String>,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
