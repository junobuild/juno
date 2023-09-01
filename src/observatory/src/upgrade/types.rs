pub mod upgrade {
    use crate::types::state::Archive;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::cronjob::CronJobStatusesSegments;
    use shared::types::state::{Controllers, Metadata, MissionControlId, UserId};
    use std::collections::HashMap;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: Controllers,
        pub cron_tabs: UpgradeCronTabs,
        pub archive: Archive,
    }

    pub type UpgradeCronTabs = HashMap<UserId, UpgradeCronTab>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct UpgradeCronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: UpgradeCronJobs,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeCronJobs {
        pub metadata: Metadata,
        pub statuses: UpgradeCronJobStatuses,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeCronJobStatuses {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
        pub mission_control_cycles_threshold: Option<u64>,
        pub satellites: CronJobStatusesSegments,
    }
}
