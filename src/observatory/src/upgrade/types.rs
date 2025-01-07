pub mod upgrade {
    use candid::{CandidType, Principal};
    use junobuild_shared::types::state::{
        ArchiveTime, Controllers, Metadata, MissionControlId, SegmentsStatuses, Timestamp, UserId,
        Version,
    };
    use serde::Deserialize;
    use std::collections::HashMap;

    pub type CronTabs = HashMap<UserId, CronTab>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: Controllers,
        pub cron_tabs: CronTabs,
        pub archive: Archive,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
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

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobs {
        pub metadata: Metadata,
        pub statuses: CronJobStatuses,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobStatuses {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
        pub mission_control_cycles_threshold: Option<u64>,
        pub satellites: CronJobStatusesSegments,
        pub orbiters: CronJobStatusesSegments,
    }

    pub type CronJobStatusesSegments = HashMap<Principal, CronJobStatusesConfig>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CronJobStatusesConfig {
        pub enabled: bool,
        pub cycles_threshold: Option<u64>,
    }
}
