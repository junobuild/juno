pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::interface::SegmentsStatus;
    use shared::types::state::{Controllers, MissionControlId};
    use std::collections::HashMap;

    pub type MissionControlCronJobs = HashMap<MissionControlId, CronJobsConfig>;
    pub type Statuses = HashMap<MissionControlId, Result<SegmentsStatus, String>>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
        pub runtime: RuntimeState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub controllers: Controllers,
        pub cron_jobs_controllers: Controllers,
        pub cron_jobs: MissionControlCronJobs,
    }

    #[derive(Default, Clone)]
    pub struct RuntimeState {
        pub statuses: Statuses,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CronJobsConfig {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
