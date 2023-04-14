pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::state::{
        ArchiveTime, Controllers, MissionControlId, SegmentsStatuses, UserId,
    };
    use std::collections::HashMap;

    pub type CronTabs = HashMap<UserId, CronTab>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        // Controllers of the observatory - i.e. of the canister (can start, stop the canister etc.)
        pub controllers: Controllers,
        // Additional controllers which can start and collect results of the cron_jobs only
        pub cron_controllers: Controllers,
        pub cron_tabs: CronTabs,
        pub archive: Archive,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: HashMap<UserId, ArchiveStatuses>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct ArchiveStatuses {
        pub timestamp: ArchiveTime,
        pub statuses: Result<SegmentsStatuses, String>,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::state::{ArchiveTime, MissionControlId, SegmentsStatuses};

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CollectStatusesArgs {
        pub time_delta: Option<u64>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct CollectStatuses {
        pub cron_jobs: CronJobs,
        pub timestamp: ArchiveTime,
        pub statuses: Result<SegmentsStatuses, String>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SetCronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub updated_at: Option<u64>,
    }
}
