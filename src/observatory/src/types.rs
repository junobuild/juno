pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::state::{Controllers, MissionControlId};
    use std::collections::HashMap;

    pub type MissionControlCronJobs = HashMap<MissionControlId, CronJobsConfig>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub controllers: Controllers,
        pub readonly_controllers: Controllers,
        pub cron_jobs: MissionControlCronJobs,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CronJobsConfig {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
