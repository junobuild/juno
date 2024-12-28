pub mod state {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::Controllers;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub controllers: Controllers,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::cronjob::CronJobs;
    use junobuild_shared::types::state::{
        ArchiveTime, MissionControlId, SegmentsStatuses, Version,
    };

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListStatusesArgs {
        pub time_delta: Option<u64>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct ListStatuses {
        pub cron_jobs: CronJobs,
        pub timestamp: ArchiveTime,
        pub statuses: Result<SegmentsStatuses, String>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SetCronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub version: Option<Version>,
    }
}
